import { useState } from "react";

import { Badge, BottomSheet, Button, Divider, Dropdown, Icon, Label, ProgressStep, Radio, Snackbar, Text, TextField, TiketProvider, TopBar } from "@tiket-ds/ui";

import { HOME_HREF } from "./home.js";
import bca from "./logos/bca.png";
import blu from "./logos/blu.png";
import dana from "./logos/dana.png";
import debitCard from "./logos/debit-card.png";
import gopay from "./logos/gopay.png";
import kredivo from "./logos/kredivo.png";
import mastercard from "./logos/mastercard.png";
import ovo from "./logos/ovo.png";
import visa from "./logos/visa.png";
import chevronRight from "../../../tds library/tds icon/tds_ic_chevron_right.svg";
import ovalPlus from "../../../tds library/tds icon/tds_ic_oval_plus.svg";
import chevronDown from "../../../tds library/tds icon/tds_ic_chevron_down.svg";
import cross from "../../../tds library/tds icon/tds_ic_cross.svg";
import information from "../../../tds library/tds icon/tds_ic_information.svg";
import locker from "../../../tds library/tds icon/tds_ic_locker.svg";

/**
 * PRD: Unified Card Token with Blibli (Graceful approach).
 *  - 002: paying with a legacy Cybersource card is blocked until the customer re-enters it;
 *    all legacy cards are shown together on one sheet.
 *  - 005: the saved payment methods page flags each legacy card ("Needs update") with its
 *    own "Re-save card" button, without blocking anything else.
 *  - 001/002: re-entry is treated exactly like a new-card save and gets a Blibli token.
 *  - 003: a purged card is gone and the customer sees a notice that it was removed.
 */

type Card = { id: string; brand: string; last4: string; expiry: string; legacy: boolean; kind: string; bank: string };
type Screen = "start" | "methods" | "checkout" | "paid";

const INITIAL_CARDS: Card[] = [
  { id: "mc-5340", brand: "Mastercard", last4: "5340", expiry: "11/29", legacy: true, kind: "Debit", bank: "BCA" },
  { id: "visa-4242", brand: "Visa", last4: "4242", expiry: "08/28", legacy: true, kind: "Credit", bank: "Mandiri" },
  { id: "visa-1881", brand: "Visa", last4: "1881", expiry: "03/29", legacy: false, kind: "Credit", bank: "BNI" },
];

const idr = new Intl.NumberFormat("id-ID");
const TOTAL = 1_450_000;

/** Logos exported from the Payment Design System in Figma ("Logo Payment with BG"). */
const Logo = ({ src, name }: { src: string; name: string }) => <img className="uct-logo" src={src} alt={name} />;

const BackIcon = () => (
  <Icon size={24}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  </Icon>
);

export function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [version, setVersion] = useState<1 | 2>(1);
  const v2 = version === 2;
  const [selectedId, setSelectedId] = useState("mc-5340");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [origin, setOrigin] = useState<"checkout" | "methods">("methods");
  const [toast, setToast] = useState<string | null>(null);
  const [purgedNotice, setPurgedNotice] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);

  const legacyCards = cards.filter((c) => c.legacy);
  const selected = cards.find((c) => c.id === selectedId);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const startReentry = (card: Card, from: "checkout" | "methods") => {
    setEditing(card);
    setOrigin(from);
    setNumber("");
    setExpiry("");
    setCvv("");
    setName("");
    setTried(false);
    setSheetOpen(false);
    setScreen(from);
    setFormOpen(true);
  };

  const pay = () => {
    if (selected?.legacy) setSheetOpen(true); // Req. 002: never charge the old token
    else setScreen("paid");
  };

  const formValid = number.replace(/\s/g, "").length === 16 && /^\d{2}\/\d{2}$/.test(expiry) && cvv.length >= 3 && name.trim().length > 1;

  const submitForm = () => {
    setTried(true);
    if (!formValid || !editing) return;
    setSaving(true);
    window.setTimeout(() => {
      const last4 = number.replace(/\s/g, "").slice(-4);
      // Same as a new-card save: Blibli returns a token that replaces the legacy one.
      if (editing.id === "new") {
        setCards((prev) => [...prev, { id: `new-${last4}`, brand: "Visa", last4, expiry, legacy: false, kind: "Credit", bank: "Bank" }]);
      } else {
        setCards((prev) => prev.map((c) => (c.id === editing.id ? { ...c, legacy: false, last4, expiry } : c)));
      }
      setSaving(false);
      setFormOpen(false);
      if (origin === "checkout") setScreen("paid");
      else {
        notify(editing.id === "new" ? "Card added" : "Card updated and ready to use");
      }
    }, 900);
  };

  const purgeText = (removed: string[]) =>
    v2
      ? "Some older cards were not updated in time and were removed from your saved cards. You can add them again anytime."
      : `${removed.join(" and ")} ${removed.length > 1 ? "were" : "was"} removed. Add the card again to keep using it.`;

  const simulatePurge = () => {
    const removed = legacyCards.map((c) => `${c.brand} •••• ${c.last4}`);
    if (removed.length === 0) return;
    setCards((prev) => prev.filter((c) => !c.legacy));
    setPurgedNotice(purgeText(removed));
    setSelectedId("visa-1881");
  };

  const runScenario = (id: "checkout" | "methods" | "purged") => {
    reset();
    if (id === "checkout") setScreen("checkout");
    if (id === "methods") setScreen("methods");
    if (id === "purged") {
      setCards(INITIAL_CARDS.filter((c) => !c.legacy));
      setSelectedId("visa-1881");
      setPurgedNotice(purgeText(["Mastercard •••• 5340", "Visa •••• 4242"]));
      setScreen("methods");
    }
  };

  const reset = (ver: 1 | 2 = version) => {
    setCards(INITIAL_CARDS);
    setSelectedId(ver === 2 ? "bca-va" : "mc-5340");
    setPurgedNotice(null);
    setScreen("start");
  };

  return (
    <TiketProvider theme="light" platform="mobile" className="uct-stage">
      <div className="uct-screen" data-version={version}>
        <nav className="uct-demo" aria-label="Prototype controls">
          <Text variant="small" color="lowEmphasis">Flow</Text>
          <Button variant="tertiary" size="small" onClick={() => setScreen("start")}>Menu</Button>
          <Button variant="tertiary" size="small" onClick={() => setScreen("methods")}>Saved methods</Button>
          <Button variant="tertiary" size="small" onClick={() => setScreen("checkout")}>Checkout</Button>
          <Button variant="tertiary" size="small" onClick={simulatePurge}>Purge</Button>
          <Button variant="tertiary" size="small" onClick={() => reset()}>Reset</Button>
        </nav>
        <div className="uct-version">
          <Dropdown label="Prototype version" value={String(version)} onChange={(e) => { const ver = Number(e.target.value) as 1 | 2; setVersion(ver); reset(ver); }}>
            <option value="1">Version 1: PRD flow</option>
            <option value="2">Version 2: Notes flow</option>
          </Dropdown>
        </div>

        {screen === "start" && (
          <main className="uct-body uct-start">
            <Text as="h1" variant="heading3">Unified Card Token with Blibli</Text>
            <Text variant="body3" color="lowEmphasis">Pick a scenario to walk through. Use Menu at the top to come back.</Text>
            {[
              { id: "checkout" as const, req: "Req 002 · 001", title: "Pay at checkout with an old card", text: v2 ? "Choose a card marked Re-Authentication. A friendly prompt appears for that card only, you add it once, and the payment goes through." : "Choose a card marked Needs update and tap Pay now. The payment is blocked, you re-enter the card once, and the payment goes through with the new token." },
              { id: "methods" as const, req: "Req 005 · 001", title: "Update a card from Payment Methods", text: `Older cards show a ${v2 ? "Re-Authentication" : "Needs update"} badge and a Re-save card button. You can also add a brand new card.` },
              { id: "purged" as const, req: "Req 003", title: "After old cards are removed", text: `Cards that were never updated are gone and ${v2 ? "a gentle" : "a"} notice explains it. Open Checkout to see the remaining cards.` },
            ].map((sc) => (
              <button key={sc.id} className="uct-scenario" onClick={() => runScenario(sc.id)}>
                <Badge kind="text" variant="grey">{sc.req}</Badge>
                <Text variant="body2Bold">{sc.title}</Text>
                <Text variant="small" color="lowEmphasis">{sc.text}</Text>
              </button>
            ))}
          </main>
        )}

        {screen === "methods" && (
          <>
            <TopBar leading={<a href={HOME_HREF} aria-label="Back to all prototypes" className="uct-back"><BackIcon /></a>} title="Payment Methods" />
            <main className="uct-body uct-methods">
              {purgedNotice && (
                <div className="uct-notice" role="status">
                  <Text variant="body3">{purgedNotice}</Text>
                </div>
              )}

              <Text as="h2" variant="body1Bold">Credit &amp; Debit Card</Text>
              {v2 && legacyCards.length > 0 && (
                <Text variant="small" color="lowEmphasis">A few cards need a quick update. Update them by 31 Dec 2026 to keep them saved.</Text>
              )}
              {cards.map((card) => (
                <div key={card.id} className="uct-row uct-row--card" data-legacy={card.legacy || undefined}>
                  <div className="uct-row__main">
                    <Logo src={card.brand === "Visa" ? visa : mastercard} name={card.brand} />
                    <div className="uct-row__text">
                      <Text variant="body3Bold">•••• {card.last4} ({card.expiry})</Text>
                      <Text variant="small" color="lowEmphasis">{card.kind} • {card.bank}</Text>
                      {card.legacy && <span className="uct-row__badge"><Badge kind="text" variant={v2 ? "grey" : "red"}>{v2 ? "Re-Authentication" : "Needs update"}</Badge></span>}
                    </div>
                    <img src={chevronRight} alt="" width={24} height={24} />
                  </div>
                  {card.legacy && (
                    <Button variant="secondary" size="small" fullWidth onClick={() => startReentry(card, "methods")}>Re-save card</Button>
                  )}
                </div>
              ))}
              <button className="uct-row uct-row--button" onClick={() => startReentry({ id: "new", brand: "", last4: "", expiry: "", legacy: false, kind: "", bank: "" }, "methods")}>
                <Logo src={debitCard} name="Card" />
                <Text variant="body3Bold">Add Card</Text>
                <img src={ovalPlus} alt="" width={24} height={24} className="uct-row__end" />
              </button>

              <Text as="h2" variant="body1Bold" className="uct-section">Linked Account</Text>
              {[
                { n: "OVO", sub: "IDR 954", logo: ovo },
                { n: "blu", sub: "Balance: IDR 0", logo: blu },
                { n: "GoPay", sub: "Balance: IDR 8,081", logo: gopay },
              ].map(({ n, sub, logo }) => (
                <div key={n} className="uct-row"><div className="uct-row__main">
                  <Logo src={logo} name={n} />
                  <div className="uct-row__text"><Text variant="body3Bold">{n}</Text><Text variant="small" color="lowEmphasis">{sub}</Text></div>
                  <img src={chevronRight} alt="" width={24} height={24} />
                </div></div>
              ))}
              {["Connect to Kredivo", "Connect DANA Account"].map((n) => (
                <div key={n} className="uct-row"><div className="uct-row__main">
                  <Logo src={n.includes("Kredivo") ? kredivo : dana} name={n} />
                  <Text variant="body3Bold">{n}</Text>
                  <img src={ovalPlus} alt="" width={24} height={24} className="uct-row__end" />
                </div></div>
              ))}

              <Text as="h2" variant="body1Bold" className="uct-section">Bank Account</Text>
              <div className="uct-row"><div className="uct-row__main">
                <Logo src={bca} name="BCA" />
                <div className="uct-row__text"><Text variant="body3Bold">6801170444</Text><Text variant="small" color="lowEmphasis">Bank Central Asia (BCA) - Indonesia - ADRASA</Text></div>
                <img src={chevronRight} alt="" width={24} height={24} />
              </div></div>
            </main>
            <footer className="uct-terms">
              <Text variant="small" color="lowEmphasis">By adding any payment method, you have agreed to tiket.com&apos;s Terms &amp; Conditions and Privacy Policy.</Text>
            </footer>
          </>
        )}

        {screen === "checkout" && (
          <>
            <TopBar
              leading={<button className="uct-back" onClick={() => setScreen("methods")} aria-label="Back"><BackIcon /></button>}
              title="Continue to Payment"
              subtitle="Order ID : 12345678"
            />
            <main className="uct-body uct-pay">
              <ProgressStep
                steps={[{ label: "Select Method" }, { label: "Pay" }, { label: "Complete" }, { label: "Done", final: true }]}
                current={0}
                aria-label="Payment steps"
              />

              <section className="uct-order">
                <div className="uct-order__banner"><Text variant="small" color="invert">FREE refund! Reschedule allowed until 13 Dec 2023</Text></div>
                <div className="uct-order__card">
                  <div className="uct-order__timer">
                    <Text variant="body2Bold">Complete payment in</Text>
                    <span className="uct-countdown">
                      <Label tone="red" size="small">00</Label>:<Label tone="red" size="small">00</Label>:<Label tone="red" size="small">00</Label>
                    </span>
                  </div>
                  <div className="uct-product">
                    <div>
                      <Text variant="body3Bold">Universal Studio Japan - Ticket D</Text>
                      <Text variant="small" color="lowEmphasis">1 Pax • Fri, 04 Oct 2022 • 13:00</Text>
                    </div>
                    <img src={chevronDown} alt="" width={24} height={24} />
                  </div>
                  <Text variant="small" color="positive">You have got best price with bundling product.</Text>
                </div>
              </section>

              <section className="uct-methods-card">
                <Text variant="body1Bold">Payment Method</Text>
                {[
                  { id: "bca-va", title: "BCA Virtual Account", sub: undefined as string | undefined, logo: bca, legacy: false },
                  ...cards.map((c) => ({ id: c.id, title: `${c.bank} •••• ${c.last4} (${c.expiry})`, sub: `${c.kind} • ${c.brand}`, logo: c.brand === "Visa" ? visa : mastercard, legacy: c.legacy })),
                  { id: "ovo", title: "OVO", sub: "OVO Cash: IDR 5,000,000", logo: ovo, legacy: false },
                ]
                  .filter((_m, idx) => showAll || idx < 3)
                  .map((m) => (
                    <label key={m.id} className="uct-method" data-selected={selectedId === m.id || undefined}>
                      <Logo src={m.logo} name={m.title} />
                      <div className="uct-row__text">
                        <Text variant="body2Bold">{m.title}</Text>
                        {m.sub && <Text variant="small" color="lowEmphasis">{m.sub}</Text>}
                        {m.legacy && <span className="uct-row__badge"><Badge kind="text" variant={v2 ? "grey" : "red"}>{v2 ? "Re-Authentication" : "Needs update"}</Badge></span>}
                      </div>
                      <Radio name="method" checked={selectedId === m.id} onChange={() => { setSelectedId(m.id); if (v2 && m.legacy) setSheetOpen(true); }} aria-label={m.title} />
                    </label>
                  ))}
                <button className="uct-seeall" onClick={() => setShowAll((v) => !v)}>
                  <Text variant="body3Bold" color="active">{showAll ? "See less" : "See all"}</Text>
                  <img src={chevronDown} alt="" width={24} height={24} data-flipped={showAll || undefined} />
                </button>
              </section>
            </main>
            <footer className="uct-paybar">
              <div className="uct-paybar__total">
                <Text variant="body1Bold">IDR {idr.format(TOTAL)}</Text>
                <img src={chevronDown} alt="" width={24} height={24} />
              </div>
              <Button variant="primary" size="large" onClick={pay}>Pay now</Button>
            </footer>
            <BottomSheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              title={v2 ? "A quick refresh for your card" : "Re-enter your card to continue"}
              subtext={v2
                ? "We're doing a routine update to how saved cards work. Add this card once more and you're all set. Your card is fine, think of it like refreshing an old password."
                : "We upgraded how cards are stored. Re-enter once and this payment goes through right away."}
            >
              {v2 ? (
                <div className="uct-sheet-list">
                  {selected && (
                    <div className="uct-sheet-row">
                      <Text variant="body2Bold">{selected.bank} •••• {selected.last4}</Text>
                      <Text variant="small" color="lowEmphasis">{selected.kind} • {selected.brand}</Text>
                    </div>
                  )}
                  <Button variant="primary" size="large" fullWidth onClick={() => selected && startReentry(selected, "checkout")}>Update card</Button>
                  <Button variant="tertiary" size="large" fullWidth onClick={() => { setSheetOpen(false); setSelectedId("bca-va"); }}>Pay another way</Button>
                </div>
              ) : (
                <div className="uct-sheet-list">
                  {legacyCards.map((card, i) => (
                    <div key={card.id}>
                      {i > 0 && <Divider />}
                      <div className="uct-sheet-row">
                        <Text variant="body2Bold">{card.brand} •••• {card.last4}</Text>
                        <Button variant={card.id === selectedId ? "primary" : "secondary"} size="small" onClick={() => startReentry(card, "checkout")}>
                          {card.id === selectedId ? "Re-enter and pay" : "Re-enter"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BottomSheet>
          </>
        )}

        <BottomSheet
          open={formOpen && !!editing}
          onClose={() => !saving && setFormOpen(false)}
          title="Credit/Debit Card Details"
          link={
            <button className="uct-back" onClick={() => setFormOpen(false)} aria-label="Close">
              <img src={cross} alt="" width={24} height={24} />
            </button>
          }
        >
          {editing && (
            <div className="uct-form">
              {editing.id !== "new" && (
                <Text variant="body3" color="lowEmphasis">
                  {v2 ? "Updating" : "Re-entering"} {editing.brand} •••• {editing.last4}.{" "}
                  {origin === "checkout" ? (v2 ? "Your payment continues right after." : "Your payment continues after this.") : v2 ? "It only takes a moment." : "It works like adding a new card."}
                </Text>
              )}
              <div className="uct-partners">
                <Text variant="body3">Our partners</Text>
                <div className="uct-partners__logos">
                  <Logo src={visa} name="Visa" />
                  <Logo src={mastercard} name="Mastercard" />
                </div>
              </div>
              <TextField label="Credit/debit card number" inputMode="numeric" value={number} maxLength={19}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                error={tried && number.replace(/\s/g, "").length !== 16} helperText={tried && number.replace(/\s/g, "").length !== 16 ? "Enter the 16 digits on your card" : undefined} />
              <div className="uct-pair">
                <TextField label="MM/YY" inputMode="numeric" value={expiry} maxLength={5}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                  }}
                  error={tried && !/^\d{2}\/\d{2}$/.test(expiry)} />
                <TextField label="CVC/CVV" inputMode="numeric" type="password" value={cvv} maxLength={4}
                  endIcon={<img src={information} alt="What is CVC/CVV?" width={24} height={24} />}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} error={tried && cvv.length < 3} />
              </div>
              <TextField label="Cardholder name" value={name} onChange={(e) => setName(e.target.value)} error={tried && name.trim().length < 2} />
              <div className="uct-protect">
                <img src={locker} alt="" width={24} height={24} />
                <Text variant="body3">Your card info will be protected from unknown transactions.</Text>
              </div>
              <Button variant="primary" size="large" fullWidth onClick={submitForm} disabled={saving}>
                {saving ? "Saving…" : origin === "checkout" && editing.id !== "new" ? `Save and pay IDR ${idr.format(TOTAL)}` : "Save card"}
              </Button>
            </div>
          )}
        </BottomSheet>

        {screen === "paid" && (
          <main className="uct-body uct-done">
            <Text as="h1" variant="heading3">Payment successful</Text>
            <Text variant="body3" color="lowEmphasis">IDR {idr.format(TOTAL)} {v2 ? "paid. Your card is updated and ready for next time." : "paid with a card that now uses the new secure token."}</Text>
            <Button variant="primary" size="large" fullWidth onClick={() => setScreen("methods")}>View saved cards</Button>
          </main>
        )}

        {toast && <div className="uct-toast"><Snackbar>{toast}</Snackbar></div>}
      </div>
    </TiketProvider>
  );
}
