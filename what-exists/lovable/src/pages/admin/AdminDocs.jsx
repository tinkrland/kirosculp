// admin documentation. this is the page a future admin reads on day
// one. it explains how the gate works today, how to operate the
// sections, and what is coming when single-password auth is replaced
// by multi-profile admin accounts.

import AdminLayout from "@/components/admin/AdminLayout";
import {
  Lock,
  Package,
  Factory,
  Route as RouteIcon,
  Settings,
  Users,
  ShieldCheck,
} from "lucide-react";

function DocBlock({ icon: Icon, title, children }) {
  return (
    <section className="bg-card border border-border/50 rounded-[16px] p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-sm tracking-widest uppercase text-muted-foreground/70">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground/80 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function AdminDocs() {
  return (
    <AdminLayout title="admin docs" subtitle="how the panel works today and where it is going">
      <div className="space-y-4">
        <DocBlock icon={Lock} title="how access works today">
          <p>
            the entire /admin/* surface sits behind a single universal password.
            on first visit you enter it; the unlocked state is held in session
            storage and clears when you close the tab or use the lock action.
          </p>
          <p className="text-xs text-muted-foreground/60">
            this is intentional for the pilot. a single shared credential keeps
            operational overhead low while the platform is in early access.
          </p>
        </DocBlock>

        <DocBlock icon={Users} title="multi-profile admin accounts (planned)">
          <p>
            the universal password will be replaced by named admin profiles
            backed by the same auth system the rest of the app uses. each
            admin gets a role row in the user_roles table, granular per-section
            permissions, an audit trail, and personal session expiry.
          </p>
          <p>
            existing pages will be reused unchanged; only the gate component
            swaps from password check to a role check.
          </p>
        </DocBlock>

        <DocBlock icon={Package} title="review queue">
          <p>
            three tabs. <b>submissions</b> shows artifacts in pending_review,
            with a manufacturing cost field that locks in the listing price the
            moment you approve. <b>all artifacts</b> is a flat read of every
            artifact in the system. <b>orders</b> lets you change status and
            attach a tracking number for any order.
          </p>
        </DocBlock>

        <DocBlock icon={Factory} title="manufacturers">
          <p>
            each row is a partner manufacturing service with its own api
            endpoint, capabilities, supported materials, and credential
            reference. only the reference name lives in the database; the
            actual key is stored as a server secret and rotated independently.
          </p>
          <p>
            mark exactly one manufacturer as default. that is the partner
            sales routing falls back to when an artifact does not specify its
            own.
          </p>
        </DocBlock>

        <DocBlock icon={RouteIcon} title="sales routing">
          <p>
            decides what happens after a buyer pays. the pilot ships in
            <b> stripe sandbox </b> mode so nothing real moves. when you are
            ready for live cutover, switch to manual fulfilment first to
            verify orders land cleanly, then promote to auto routing once a
            manufacturer is fully connected.
          </p>
          <p>
            payout mode is separate from order routing. it controls how
            creators get paid out from the balance you accumulate on their
            behalf.
          </p>
        </DocBlock>

        <DocBlock icon={Settings} title="platform settings">
          <p>
            global toggles that affect the whole site. the support email is
            shown anywhere we ask people to reach out. maintenance mode drops
            a soft pause notice on the storefront and disables checkout
            without taking dashboards offline.
          </p>
        </DocBlock>

        <DocBlock icon={ShieldCheck} title="security notes">
          <p>
            never paste real api keys into manufacturer rows. always use a
            secret reference and store the key on the server. the password
            gate is not a substitute for real auth; do not ship it to
            production once paying customers are involved.
          </p>
        </DocBlock>
      </div>
    </AdminLayout>
  );
}
