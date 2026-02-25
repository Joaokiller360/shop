
import { useCustomer } from '@components/frontStore/customer/CustomerContext.jsx';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useState } from 'react';
import { Image } from '@components/common/Image.js';
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail.js';

const ModalDetails = ({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: any;
}) => {
  if (!open || !order) return null;

  const { customer } = useCustomer();
  const orders = customer || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="modal w-full h-full flex items-center justify-center">
        <div className="bg-white text-card-foreground rounded-xl p-6 text-sm shadow ring-1 ring-foreground/10 flex flex-col gap-6 max-w-2xl w-full">

          {/* header */}
          <div className="px-6 justify-center text-center">
            <h2 className="text-2xl font-medium">
              {_('Details')}
            </h2>
          </div>

          {/* content */}
          <div className="order-details">

            <div className='flex justify-between'>
              <p className='text-xl'><strong>{_('Number Order')}:</strong> #{order.orderNumber}</p>
              <p className='text-xl'><strong>{_('Status')}:</strong> {order.shipmentStatus?.name}</p>
            </div>
            <div className='flex justify-between'>
              <p className='text-xl'><strong>{_('Shipping Method')}:</strong> {order.shippingMethodName}</p>
            </div>

            <div className='py-2 text-lg'>
              <p><strong>{_('Country')}:</strong> {order.billingAddress?.country?.name}</p>
              <p><strong>{_('City')}:</strong> {order.billingAddress?.city}</p>
              <p><strong>{_('Shipping Address')}:</strong> {order.shippingAddress?.address1}</p>
              <p><strong>{_('Payment Method')}:</strong> {order.paymentMethodName}</p>
              <p><strong>{_('Telephone')}:</strong> {order.billingAddress?.telephone}</p>
              <p><strong>{_('Order Date')}:</strong> {order.createdAt.text}</p>
              <p><strong>{_('Total')}:</strong> ${order.grandTotal.value} {_('USD')}</p>
            </div>

            <table className="table-auto w-full">
              <thead className='bg-gray-400/50 rounded-t-lg'>
                <tr>
                  <th className="text-center align-middle">{_('Imagen')}</th>
                  <th className="text-center align-middle">{_('Product Name')}</th>
                  <th className="text-center align-middle">{_('Status')}</th>
                  <th className="text-center align-middle">{_('Shipping Address')}</th>
                  <th className="text-center align-middle">{_('Payment Method')}</th>
                </tr>
              </thead>
              <tbody className='bg-gray-400/20'>
                {order.items.map((item: any) => (
                  <tr key={order.orderNumber}>
                    <td className='text-center'>
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          width={80}
                          height={80}
                          className="rounded-md"
                          alt={item.productName || 'product'}
                        />
                      ) : (
                        <ProductNoThumbnail width={80} height={80} />
                      )}
                    </td>
                    <td className='text-center'>{item.productName}</td>
                    <td className='text-center'>{order.shipmentStatus?.name}</td>
                    <td className='text-center'>{order.shippingAddress?.address1}</td>
                    <td className='text-center'>{order.paymentMethodName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* footer */}
          < div className="px-6 flex justify-end gap-2" >
            <button
              onClick={onClose}
              className="bg-red-900/80 hover:bg-red-900 text-white px-3 py-1 rounded-md cursor-pointer"
            >
              {_('Close')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function OrderHistory({ title }: { title?: string }) {
  const { customer } = useCustomer();
  const orders = customer?.orders || [];
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  return (
    <div className="order-history">
      {title && (
        <h2 className="order-history-title border-border">
          {title}
        </h2>
      )}

      {orders.length === 0 ? (
        <div className="order-history-empty">
          {_('You have not placed any orders yet')}
        </div>
      ) : (
        <div className="border-divider py-5">
          <table className="table-auto">
            <thead className='bg-gray-400/50'>
              <tr>
                <th className="text-center align-middle">{_('Id')}</th>
                <th className="text-center align-middle">{_('Product Name')}</th>
                <th className="text-center align-middle">{_('Order Date')}</th>
                <th className="text-center align-middle">{_('Total')}</th>
                <th className="text-center align-middle">{_('Modal')}</th>
              </tr>
            </thead>
            {orders.map((order) => (
              <tbody key={order.orderId} className='bg-gray-400/20'>
                <tr>
                  <td className='text-center'>{order.orderNumber}</td>
                  <td className='text-center'>
                    {order.items.length > 0
                      ? order.items[0]?.productName
                      : order.items[0]?.productName}
                  </td>
                  <td className='text-center'>{order.createdAt.text}</td>
                  <td className='text-center'>${order.grandTotal.value} {_('USD')}</td>
                  <td className='text-center'>
                    <button className='cursor-pointer underline' onClick={() => setSelectedOrder(order)}>{_('View Details')}</button>
                  </td>
                </tr>
              </tbody>
            ))}
          </table>

          {/* Modal fuera del loop - solo uno */}
          <ModalDetails
            open={selectedOrder !== null}
            onClose={() => setSelectedOrder(null)}
            order={selectedOrder}
          />
        </div>
      )}
    </div>
  );
}