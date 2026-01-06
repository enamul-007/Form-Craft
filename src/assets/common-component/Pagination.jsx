import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between mt-2 px-2">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 disabled:hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span>Previous</span>
            </button>

    

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <span>Next</span>
                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
        </div>
    );
};

export default Pagination;
