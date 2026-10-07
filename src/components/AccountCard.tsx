import type { Account } from '@/data/accounts';

interface Props {
  account: Account;
  onClose: () => void;
}

export default function AccountCard({ account, onClose }: Props) {
  return (
    <div className="account-card">
      <button className="account-card-close" onClick={onClose} aria-label="close">×</button>
      <div className="account-card-kind">{account.kind}</div>
      <h2 className="account-card-name">{account.name}</h2>
      {account.shop_handle && (
        <div className="account-card-shop">@{account.shop_handle}</div>
      )}
      <dl className="account-card-facts">
        <div><dt>residence</dt><dd>{account.residence ?? account.residence_note}</dd></div>
        <div><dt>region</dt><dd>{account.region.replace(/_/g, ' ')}</dd></div>
        {account.bank_country && <div><dt>bank</dt><dd>{account.bank_country}</dd></div>}
        {account.idv_country && <div><dt>idv</dt><dd>{account.idv_country}</dd></div>}
        {account.age != null && <div><dt>age</dt><dd>{account.age}</dd></div>}
        {account.classification.length > 0 && (
          <div><dt>classification</dt><dd>{account.classification.join(', ')}</dd></div>
        )}
        {account.notes && <div><dt>notes</dt><dd>{account.notes}</dd></div>}
      </dl>
    </div>
  );
}
