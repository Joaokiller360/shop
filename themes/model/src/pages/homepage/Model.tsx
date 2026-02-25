import React from 'react';

const Model: React.FC = () => {
  return (
    <div className="p-5 text-center text-2xl border border-dashed border-gray-300 my-5 mx-2 bg-blue-50 text-blue-800">
      <h3 className="mb-3">
        Welcome to the <span className="text-pink-500">&#9829; </span>
        model <span className="text-pink-500">&#9829; </span> theme!
      </h3>
      <code className="text-sm break-all">
        You can edit this file at:
        /Users/joaobarres/Documents/WordSpace/shop-jbskylens/themes/model/src/pages/homepage/Model.tsx
      </code>
    </div>
  );
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export default Model;
