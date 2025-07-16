import React, { useEffect, useRef, useState } from "react";

interface ReusableSelectProps {
  isOpen?: boolean;
  searchable?: boolean;
  searchValue?: string;
  onClose?: (state: boolean) => void;
  placeholder?: string;
  format?: any[];
  optionValue?: any[];
  setValue?: (val: any) => void;
}

const ReusableSelect: React.FC<ReusableSelectProps> = ({
  isOpen,
  searchable,
  searchValue,
  onClose,
  placeholder,
  format,
  optionValue,
  setValue,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose && onClose(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filter = format?.filter((item) => {
    const value = item?.value;
    if (typeof value !== "object" || value === null) {
      return false;
    }

    return Object.keys(value).some((key) => {
      const fieldValue = value[key];
      return (
        typeof fieldValue === "string" &&
        fieldValue.toLowerCase().includes(searchTerm?.toLowerCase())
      );
    });
  });

  const filteredOptions = optionValue?.filter((item) => {
    return (
      item?.label?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      item?.value?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  });

  useEffect(() => {
    if (searchValue) {
      setSearchTerm(searchValue);
    }
  }, [searchValue]);

  // Return null if isOpen is false instead of undefined
  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className={`absolute z-[30] bg-white top-full left-0 w-full mt-1 overflow-hidden border border-gray-200 rounded-md shadow-lg ${
        searchable === false ? "py-1" : "p-5"
      }`}
    >
      <div
        className={`${
          searchable === false && "hidden"
        } rounded-lg border border-swGray100 flex gap-1 items-center pl-4 overflow-hidden mb-2`}
      >
        <input
          type="text"
           value={searchTerm}
          placeholder={placeholder || "Search"}
          className="p-2 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={`w-full max-h-48 overflow-y-auto ${searchable === false ? "" : "p-5 border border-gray-100 rounded-2xl"}`}>
        {filter && filter.length > 0 ? (
          filter.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setValue && setValue(item?.value);
                onClose && onClose(false);
              }}
              className={`${"border-y"}`}
            >
              {item?.label}
            </div>
          ))
        ) : filteredOptions && filteredOptions.length > 0 ? (
          filteredOptions.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setValue && setValue(item?.value);
                onClose && onClose(false);
              }}
              className={`px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer ${i !== 0 && "border-t border-gray-100"}`}
            >
              {item?.label}
            </div>
          ))
        ) : optionValue && optionValue.length > 0 ? (
          optionValue.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setValue && setValue(item?.value);
                onClose && onClose(false);
              }}
              className={`px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer ${i !== 0 && "border-t border-gray-100"}`}
            >
              {item?.label}
            </div>
          ))
        ) : (
          <div className="text-center">No options found</div>
        )}
      </div>
    </div>
  );
};

export default ReusableSelect; 