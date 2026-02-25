import React from 'react';

const Test: React.FC = () => {
  return (
    <div className="p-5 text-center text-2xl border border-dashed border-gray-300 my-5 mx-2 bg-blue-50 text-blue-800">
      <h3 className="mb-3">
        Welcome to the <span className="text-pink-500">&#9829; </span>
        test <span className="text-pink-500">&#9829; </span> theme!
      </h3>
      <code className="text-sm break-all">
        You can edit this file at:
        /Users/joaobarres/Documents/WordSpace/shop-jbskylens/themes/test/src/pages/homepage/Test.tsx
      </code>
    </div>
  );
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export default Test;
