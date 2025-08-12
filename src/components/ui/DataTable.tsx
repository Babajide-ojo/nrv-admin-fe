'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import useDebounce from '@/lib/useDebounce';
import ReusableSelect from '@/components/ui/ReusableSelect';
import api from '@/lib/api/axios';

// Types
export interface BaseRow {
  _id?: string;
  [key: string]: any;
}

export interface ColumnConfig<T extends BaseRow = BaseRow> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterConfig {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DataTableResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface DataTableProps<T extends BaseRow = BaseRow> {
  endpoint: string;
  columns: ColumnConfig<T>[];
  filters?: FilterConfig[];
  status?: string;
  searchTerm?: boolean;
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  initialPageSize?: number;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  emptyStateComponent?: React.ComponentType;
  loadingRows?: number;
}

// Error component
const DefaultErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <p className="text-red-600 mb-4">Failed to load data: {error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
    >
      Retry
    </button>
  </div>
);

// Empty state component
const DefaultEmptyStateComponent: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <p className="text-gray-500 text-lg mb-2">No data found</p>
    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
  </div>
);

// Loading skeleton component
const LoadingSkeleton: React.FC<{ columns: number; rows: number }> = ({ columns, rows }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        <td colSpan={columns}>
          <Skeleton className="h-10 my-2 w-full" />
        </td>
      </tr>
    ))}
  </>
);

// Pagination component
const Pagination: React.FC<{
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}> = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages } = pagination;

  const generatePageNumbers = useCallback(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    }

    if (currentPage + half > totalPages) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-end items-center mt-4 gap-2 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
        aria-label="Previous page"
      >
        Prev
      </button>

      {currentPage > 3 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors"
          >
            1
          </button>
          {currentPage > 4 && <span className="px-2">...</span>}
        </>
      )}

      {generatePageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded transition-colors ${
            currentPage === page 
              ? 'bg-black text-white' 
              : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

export default function DataTable<T extends BaseRow = BaseRow>({
  endpoint,
  columns,
  filters = [],
  status,
  searchTerm = true,
  rowActions,
  onRowClick,
  className = '',
  initialPageSize = 10,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  emptyStateComponent: EmptyStateComponent = DefaultEmptyStateComponent,
  loadingRows = 5,
}: DataTableProps<T>) {
  // State
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Debounced search
  const debouncedSearch = useDebounce(search, 500);

  // Computed values
  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination: PaginationInfo = useMemo(() => ({
    currentPage,
    pageSize,
    totalCount,
    totalPages,
  }), [currentPage, pageSize, totalCount, totalPages]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      Object.entries(filterState).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      // Add search parameter if provided
      if (debouncedSearch && debouncedSearch.trim()) {
        queryParams.append('search', debouncedSearch);
      }
      
      // Log the final URL and params
      console.log('DataTable: Final URL:', api.defaults.baseURL + endpoint);
      console.log('DataTable: Final params:', Object.fromEntries(queryParams.entries()));
      
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', pageSize.toString());
      
      if (status) {
        queryParams.append('status', status);
      }

      console.log('DataTable: Making API call to', endpoint, 'with params:', Object.fromEntries(queryParams.entries()));
      console.log('DataTable: Full URL will be:', api.defaults.baseURL + endpoint);
      
      const response = await api.get(endpoint, {
        params: Object.fromEntries(queryParams.entries())
      });
      
      console.log('DataTable: API response:', response.data);
      
      const json: DataTableResponse<T> = response.data;
      
      // Handle different response structures
      const responseData = json?.data || [];
      const responsePagination = json?.pagination || {};
      
      console.log('DataTable: Processed data:', responseData);
      console.log('DataTable: Processed pagination:', responsePagination);
      console.log('DataTable: Response data length:', responseData.length);
      console.log('DataTable: Response data type:', typeof responseData);
      console.log('DataTable: Is array:', Array.isArray(responseData));
      
      setData(Array.isArray(responseData) ? responseData : []);
      setTotalCount((responsePagination as any).total || 0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      console.error('DataTable fetch error:', error);
      console.error('DataTable error details:', err);
      
      // Log more details about the error
      if (err && typeof err === 'object' && 'response' in err) {
        console.error('DataTable response error:', (err as any).response);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, debouncedSearch, filterState, currentPage, pageSize, status]);

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterName: string, value: string) => {
    setFilterState((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  }, []);

  const handleDropdownToggle = useCallback((filterName: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  }, []);

  const handleDropdownClose = useCallback((filterName: string, isOpen: boolean) => {
    setOpenDropdowns((prev) => ({ ...prev, [filterName]: isOpen }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowClick = useCallback((row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick]);

  // Render functions
  const renderTableHeader = () => (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {columns.map((col) => (
          <th 
            key={String(col.key)} 
            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
            style={{ width: col.width }}
          >
            {col.label}
          </th>
        ))}
        {rowActions && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>}
      </tr>
    </thead>
  );

  const renderTableBody = () => {
    if (loading) {
      return <LoadingSkeleton columns={columns.length + (rowActions ? 1 : 0)} rows={loadingRows} />;
    }

    if (error) {
      return (
        <tr>
          <td colSpan={columns.length + (rowActions ? 1 : 0)}>
            <ErrorComponent error={error} retry={fetchData} />
          </td>
        </tr>
      );
    }

    if (!data.length) {
      return (
        <tr>
          <td colSpan={columns.length + (rowActions ? 1 : 0)}>
            <EmptyStateComponent />
          </td>
        </tr>
      );
    }

    return data.map((row, index) => (
      <tr 
        key={row._id || index} 
        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
          onRowClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => handleRowClick(row)}
      >
        {columns.map((col) => (
          <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-900">
            {col.render ? col.render(row[col.key], row) : String(row[col.key] || '')}
          </td>
        ))}
        {rowActions && (
          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
            {rowActions(row)}
          </td>
        )}
      </tr>
    ));
  };

  return (
    <div className={`p-4 bg-white rounded-xl shadow-md font-jakarta ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        {searchTerm && (
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full md:w-1/3"
            aria-label="Search table data"
          />
        )}
        {filters.map((filter) => (
          <div key={filter.name} className="relative">
            <button
              type="button"
              onClick={() => handleDropdownToggle(filter.name)}
              className="flex items-center justify-between w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
            >
              <span className={filterState[filter.name] ? 'text-gray-900' : 'text-gray-500'}>
                {filterState[filter.name] 
                  ? filter.options.find(opt => opt.value === filterState[filter.name])?.label || filter.label
                  : filter.label
                }
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ReusableSelect
              isOpen={openDropdowns[filter.name] || false}
              onClose={(isOpen) => handleDropdownClose(filter.name, isOpen)}
              searchable={false}
              optionValue={filter.options.map(opt => ({ label: opt.label, value: opt.value }))}
              setValue={(value) => {
                handleFilterChange(filter.name, value);
                handleDropdownClose(filter.name, false);
              }}
            />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg">
        <table className="min-w-full text-left">
          {renderTableHeader()}
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 0 && (
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
} 