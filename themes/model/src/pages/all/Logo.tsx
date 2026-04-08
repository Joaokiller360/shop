import React from 'react';

interface LogoProps {
  themeConfig: {
    logo: {
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
  };
}
export default function Logo({
  themeConfig: {
    logo: { src, alt = 'Evershop', width = 128, height = 128 }
  }
}: LogoProps) {
  return (
    <div className="logo md:ml-0 flex justify-center items-center">
      {src && (
        <a href="/" className="logo-icon">
          <img src={src} alt={alt} width={width} height={height} />
        </a>
      )}
      {!src && (
        <>
          <a href='/' className="logo-icon">
            <img src={`https://res.cloudinary.com/dzlavqhid/image/upload/logo-p.png`} className="w-14 h-14 rounded-full" />
          </a>
        </>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'headerMiddleCenter',
  sortOrder: 10
};

export const query = `
  query query {
    themeConfig {
      logo {
        src
        alt
        width
        height
      }
    }
  }
`;
