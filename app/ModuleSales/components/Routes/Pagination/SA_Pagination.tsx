import React from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { AiOutlineDoubleLeft, AiOutlineDoubleRight } from "react-icons/ai";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const goToPage = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    onPageChange(clampedPage);
  };

  return (
    <div className="flex flex-wrap items-center space-x-1 text-[10px]">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        title="First Page"
        aria-label="First Page"
        className="bg-gray-200 px-2 py-2 rounded disabled:opacity-50 flex items-center focus:outline-none focus:ring"
      >
        <AiOutlineDoubleLeft size={12} />
      </button>

      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        title="Previous Page"
        aria-label="Previous Page"
        className="bg-gray-200 px-2 py-2 rounded disabled:opacity-50 flex items-center focus:outline-none focus:ring"
      >
        <MdNavigateBefore size={12} />
        <span>Prev</span>
      </button>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        title="Next Page"
        aria-label="Next Page"
        className="bg-gray-200 px-2 py-2 rounded disabled:opacity-50 flex items-center focus:outline-none focus:ring"
      >
        <span>Next</span>
        <MdNavigateNext size={12} />
      </button>

      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages || totalPages === 0}
        title="Last Page"
        aria-label="Last Page"
        className="bg-gray-200 px-2 py-2 rounded disabled:opacity-50 flex items-center focus:outline-none focus:ring"
      >
        <AiOutlineDoubleRight size={12} />
      </button>

      <span className="ml-2 text-[10px]">
        Page {currentPage} of {totalPages || 1}
      </span>
    </div>
  );
};

export default Pagination;
