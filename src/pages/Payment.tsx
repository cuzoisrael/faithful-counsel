import { useLocation, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/shared/SectionHeading";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BANK = {
  accountName: "Ogbonna Onyenweaku",
  bank: "GTB",
  accountNumber: "0436373304",
};

const PaymentDetails = ({ heading }: { heading: string }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 1800);
  };
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-4">{heading}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Please make your payment via bank transfer to the account below and send your proof of payment to our contact email.
      </p>
      <div className="divide-y divide-border">
        {[
          ["Account Name", BANK.accountName],
          ["Bank", BANK.bank],
          ["Account Number", BANK.accountNumber],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-foreground">{value}</p>
            </div>
            <button onClick={() => copy(label, value)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-secondary text-foreground hover:bg-secondary/80">
              {copied === label ? <CheckCircle2 size={14} className="text-primary" /> : <Copy size={14} />}
              {copied === label ? "Copied" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Payment = () => {
  const location = useLocation();
  const fromBooking = (location.state as any)?.fromBooking as "session" | "conference" | undefined;

  return (
    <Layout>
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Payment"
            title="Complete Your Payment"
            description="Thank you for your booking. Use the details below to finalize your payment."
            centered
          />

          <div className="max-w-2xl mx-auto mt-10 space-y-6">
            {fromBooking && (
              <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-foreground">Your {fromBooking === "conference" ? "conference registration" : "session booking"} was received.</p>
                  <p className="text-sm text-muted-foreground">Complete payment below to confirm your slot.</p>
                </div>
              </div>
            )}

            {!fromBooking && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-foreground">Payment details are shown after booking.</p>
                  <p className="text-sm text-muted-foreground">
                    Please <Link to="/bookings" className="text-primary font-semibold hover:underline">book a session</Link> first to receive payment instructions.
                  </p>
                </div>
              </div>
            )}

            {fromBooking && (
              <>
                <PaymentDetails heading={fromBooking === "conference" ? "Conference Booking" : "Session Booking"} />
                {fromBooking === "session" && (
                  <PaymentDetails heading="Conference Booking" />
                )}
              </>
            )}

            <div className="text-center">
              <Link to="/contact" className="text-sm text-primary font-semibold hover:underline">Need help? Contact us →</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Payment;
