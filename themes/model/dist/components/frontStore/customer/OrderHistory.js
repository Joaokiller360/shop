import { useCustomer } from '@components/frontStore/customer/CustomerContext.jsx';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useState } from 'react';
import { Image } from '@components/common/Image.js';
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail.js';
const ModalDetails = ({ open, onClose, order })=>{
    if (!open || !order) return null;
    const { customer } = useCustomer();
    const orders = customer || [];
    return /*#__PURE__*/ React.createElement("div", {
        className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "modal w-full h-full flex items-center justify-center"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "bg-white text-card-foreground rounded-xl p-6 text-sm shadow ring-1 ring-foreground/10 flex flex-col gap-6 max-w-2xl w-full"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "px-6 justify-center text-center"
    }, /*#__PURE__*/ React.createElement("h2", {
        className: "text-2xl font-medium"
    }, _('Details'))), /*#__PURE__*/ React.createElement("div", {
        className: "order-details"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "flex justify-between"
    }, /*#__PURE__*/ React.createElement("p", {
        className: "text-xl"
    }, /*#__PURE__*/ React.createElement("strong", null, _('Number Order'), ":"), " #", order.orderNumber), /*#__PURE__*/ React.createElement("p", {
        className: "text-xl"
    }, /*#__PURE__*/ React.createElement("strong", null, _('Status'), ":"), " ", order.shipmentStatus?.name)), /*#__PURE__*/ React.createElement("div", {
        className: "py-2 text-lg"
    }, /*#__PURE__*/ React.createElement("p", null, /*#__PURE__*/ React.createElement("strong", null, _('Country'), ":"), " ", order.billingAddress?.country?.name), /*#__PURE__*/ React.createElement("p", null, /*#__PURE__*/ React.createElement("strong", null, _('City'), ":"), " ", order.billingAddress?.city), /*#__PURE__*/ React.createElement("p", null, /*#__PURE__*/ React.createElement("strong", null, _('Shipping Address'), ":"), " ", order.shippingAddress?.address1), /*#__PURE__*/ React.createElement("p", null, /*#__PURE__*/ React.createElement("strong", null, _('Payment Method'), ":"), " ", order.paymentMethod?.name), /*#__PURE__*/ React.createElement("p", null, /*#__PURE__*/ React.createElement("strong", null, _('Telephone'), ":"), " ", order.billingAddress?.telephone), /*#__PURE__*/ React.createElement("p", null, /*#__PURE__*/ React.createElement("strong", null, _('Order Date'), ":"), " ", order.createdAt.text), /*#__PURE__*/ React.createElement("p", null, /*#__PURE__*/ React.createElement("strong", null, _('Total'), ":"), " $", order.grandTotal.value, " ", _('USD'))), /*#__PURE__*/ React.createElement("table", {
        className: "table-auto w-full"
    }, /*#__PURE__*/ React.createElement("thead", {
        className: "bg-gray-400/50 rounded-t-lg"
    }, /*#__PURE__*/ React.createElement("tr", null, /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Imagen')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Product Name')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Status')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Shipping Address')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Payment Method')))), /*#__PURE__*/ React.createElement("tbody", {
        className: "bg-gray-400/20"
    }, order.items.map((item)=>/*#__PURE__*/ React.createElement("tr", {
            key: order.orderNumber
        }, /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, item.thumbnail ? /*#__PURE__*/ React.createElement(Image, {
            src: item.thumbnail,
            width: 80,
            height: 80,
            className: "rounded-md",
            alt: item.productName || 'product'
        }) : /*#__PURE__*/ React.createElement(ProductNoThumbnail, {
            width: 80,
            height: 80
        })), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, item.productName), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, order.shipmentStatus?.name), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, order.shippingAddress?.address1), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, order.paymentMethodName)))))), /*#__PURE__*/ React.createElement("div", {
        className: "px-6 flex justify-end gap-2"
    }, /*#__PURE__*/ React.createElement("button", {
        onClick: onClose,
        className: "bg-red-900/80 hover:bg-red-900 text-white px-3 py-1 rounded-md cursor-pointer"
    }, _('Close'))))));
};
export default function OrderHistory({ title }) {
    const { customer } = useCustomer();
    const orders = customer?.orders || [];
    const [selectedOrder, setSelectedOrder] = useState(null);
    return /*#__PURE__*/ React.createElement("div", {
        className: "order-history"
    }, title && /*#__PURE__*/ React.createElement("h2", {
        className: "order-history-title border-border"
    }, title), orders.length === 0 ? /*#__PURE__*/ React.createElement("div", {
        className: "order-history-empty"
    }, _('You have not placed any orders yet')) : /*#__PURE__*/ React.createElement("div", {
        className: "border-divider py-5"
    }, /*#__PURE__*/ React.createElement("table", {
        className: "table-auto"
    }, /*#__PURE__*/ React.createElement("thead", {
        className: "bg-gray-400/50"
    }, /*#__PURE__*/ React.createElement("tr", null, /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Id')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Product Name')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Order Date')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Total')), /*#__PURE__*/ React.createElement("th", {
        className: "text-center align-middle"
    }, _('Modal')))), orders.map((order)=>/*#__PURE__*/ React.createElement("tbody", {
            key: order.orderId,
            className: "bg-gray-400/20"
        }, /*#__PURE__*/ React.createElement("tr", null, /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, order.orderNumber), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, order.items.length > 0 ? order.items[0]?.productName : order.items[0]?.productName), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, order.createdAt.text), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, "$", order.grandTotal.value, " ", _('USD')), /*#__PURE__*/ React.createElement("td", {
            className: "text-center"
        }, /*#__PURE__*/ React.createElement("button", {
            className: "cursor-pointer underline",
            onClick: ()=>setSelectedOrder(order)
        }, _('View Details'))))))), /*#__PURE__*/ React.createElement(ModalDetails, {
        open: selectedOrder !== null,
        onClose: ()=>setSelectedOrder(null),
        order: selectedOrder
    })));
}
