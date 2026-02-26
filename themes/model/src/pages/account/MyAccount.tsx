import Area from '@components/common/Area.js';
import AccountInfo from '@components/frontStore/customer/AccountInfo.js';
import { MyAddresses } from '@components/frontStore/customer/MyAddresses.js';
import OrderHistory from '@components/frontStore/customer/OrderHistory.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import {
  useCustomer
} from '@components/frontStore/customer/CustomerContext.jsx';

export default function MyAccount() {

  const { customer: account } = useCustomer();

  return (
    <div>
      <div className='items-center justify-center flex flex-col'>
        <img width="100" height="100" className='rounded-full items-center' src='https://res.cloudinary.com/dzlavqhid/image/upload/v1768936317/logo.png' alt={account?.fullName} />
        <h1 className="text-center">{_('Welcome back')}: <span className='uppercase'>{account?.fullName}</span></h1>
      </div>
      <div className="page-width mt-7 grid grid-cols-1 md:grid-cols-3 gap-7">
        <div className="col-span-1 md:col-span-2">
          <MyAddresses title={_('Address Book')} />
        </div>
        <div className="col-span-1">
          <AccountInfo title={_('Account Information')} showLogout />
        </div>
      </div>
      <div className="page-width mt-7">
        <OrderHistory title={_('Recent Orders')} />
        <Area id="accountPageAddressBook" noOuter />
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
