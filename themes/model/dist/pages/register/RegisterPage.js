import { Card, CardContent } from '@components/common/ui/Card.js';
import { CustomerRegistrationForm } from '@components/frontStore/customer/RegistrationForm.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { toast } from 'react-toastify';
export default function RegisterPage({ homeUrl, loginUrl }) {
    return /*#__PURE__*/ React.createElement("div", {
        className: "flex justify-center items-center flex-col gap-3"
    }, /*#__PURE__*/ React.createElement(Card, {
        className: "flex justify-center items-center w-full max-w-sm md:max-w-lg lg:max-w-xl"
    }, /*#__PURE__*/ React.createElement(CardContent, {
        className: "w-full"
    }, /*#__PURE__*/ React.createElement(CustomerRegistrationForm, {
        title: _('Create an account'),
        subtitle: _('Join us for exclusive offers and order tracking'),
        redirectUrl: homeUrl,
        onError: (error)=>{
            toast.error(error);
        },
        className: "w-full"
    }))), /*#__PURE__*/ React.createElement("div", {
        className: "text-center"
    }, /*#__PURE__*/ React.createElement("span", null, _('Already have an account?'), /*#__PURE__*/ React.createElement("a", {
        className: "text-green-500 hover:underline",
        href: loginUrl
    }, ' ', _('Login'), ' '))));
}
export const layout = {
    areaId: 'content',
    sortOrder: 10
};
export const query = `
  query Query {
    homeUrl: url(routeId: "homepage")
    loginUrl: url(routeId: "login")
  }
`;
