import Area from '@components/common/Area.js';
import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import React from 'react';

export const ProductSingleName = () => {
  const { name } = useProduct();
  return (
    <>
      <Area id="productNameBefore" noOuter />
      <div className='items-center'>
        <h1 className="product__single__name capitalize text-center">{name}</h1>
      </div>
      <Area id="productNameAfter" noOuter />
    </>
  );
};
