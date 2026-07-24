import { useState } from 'react';

const OWNER_EMAIL = 'stay@carltonridgevilla.com';
const OWNER_WHATSAPP = '12460000000'; // digits only, include country code

export default function EnquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', dates: '', guests: '', message: '',
  });
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const buildMessage = () => {
    const lines = [
      `Enquiry for Carlton Ridge`,
      ``,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Proposed dates: ${form.dates || 'Flexible'}`,
      `Guests: ${form.guests || 'Not specified'}`,
      ``,
      form.message || 'No additional message.',
    ];
    return lines.join('\n');
  };

  const isValid = form.name.trim() && form.email.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    const subject = encodeURIComponent(`Villa enquiry — ${form.name}`);
    const body = encodeURIComponent(buildMessage());
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const whatsappHref = () => {
    const text = encodeURIComponent(buildMessage());
    return `https://wa.me/${OWNER_WHATSAPP}?text=${text}`;
  };

  return (
    <form className="enq-form" onSubmit={handleSubmit}>
      <div className="enq-form__row">
        <label>
          <span>Full name *</span>
          <input type="text" required value={form.name} onChange={update('name')} placeholder="Jane Herring" />
        </label>
        <label>
          <span>Email *</span>
          <input type="email" required value={form.email} onChange={update('email')} placeholder="jane@example.com" />
        </label>
      </div>
      <div className="enq-form__row">
        <label>
          <span>Proposed dates</span>
          <input type="text" value={form.dates} onChange={update('dates')} placeholder="e.g. 14–21 December 2026" />
        </label>
        <label>
          <span>Guests</span>
          <input type="text" value={form.guests} onChange={update('guests')} placeholder="e.g. 8 adults, 2 children" />
        </label>
      </div>
      <label className="enq-form__full">
        <span>Message</span>
        <textarea rows={5} value={form.message} onChange={update('message')} placeholder="Tell us a little about your stay..." />
      </label>

      <div className="enq-form__actions">
        <button type="submit" className="btn btn-gold" disabled={!isValid}>Send Enquiry by Email</button>
        <a
          className={`btn btn-outline-dark${isValid ? '' : ' is-disabled'}`}
          href={isValid ? whatsappHref() : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!isValid}
          onClick={(e) => { if (!isValid) e.preventDefault(); }}
        >
          Send via WhatsApp
        </a>
      </div>

      {sent && (
        <p className="enq-form__note" role="status">
          Your email app should now be open with your enquiry pre-filled — just hit send.
        </p>
      )}
      {!isValid && (
        <p className="enq-form__hint">Add your name and email to enable sending.</p>
      )}
    </form>
  );
}
