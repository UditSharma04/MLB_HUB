import React from 'react';

function LoadingState() {
    return (
        <div className="p-6">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-100 h-40 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LoadingState; 