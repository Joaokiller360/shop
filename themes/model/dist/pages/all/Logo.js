import React from 'react';
export default function Logo({ themeConfig: { logo: { src, alt = 'Evershop', width = 128, height = 128 } } }) {
    return /*#__PURE__*/ React.createElement("div", {
        className: "logo md:ml-0 flex justify-center items-center"
    }, src && /*#__PURE__*/ React.createElement("a", {
        href: "/",
        className: "logo-icon"
    }, /*#__PURE__*/ React.createElement("img", {
        src: src,
        alt: alt,
        width: width,
        height: height
    })), !src && /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("a", {
        href: "/",
        className: "logo-icon"
    }, /*#__PURE__*/ React.createElement("img", {
        src: `https://res.cloudinary.com/dzlavqhid/image/upload/logo-p.png`,
        className: "w-14 h-14 rounded-full"
    }))));
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
