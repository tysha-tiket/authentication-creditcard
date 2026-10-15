import { useState } from "react";

import { Button, Icon, QuantityEditor, Text, TiketProvider, TopBar } from "@tiket-ds/ui";

import { HOME_HREF } from "./home.js";

/**
 * A minimal starter screen: a phone-sized page built only from `@tiket-ds/ui`
 * components and tokens, with a little real logic (the total follows the guest count).
 * Copy this whole folder to start a new prototype — see SETUP.md, "Add a new prototype".
 */

const PRICE_PER_GUEST = 250_000;
const idr = new Intl.NumberFormat("id-ID");

export function App() {
  const [guests, setGuests] = useState(2);
  const [booked, setBooked] = useState(false);

  return (
    <TiketProvider theme="light" platform="mobile" className="ex-stage">
      <div className="ex-screen">
        <TopBar
          leading={
            <a href={HOME_HREF} aria-label="Back to all prototypes" className="ex-back">
              <Icon size={24}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Icon>
            </a>
          }
          title="Example Prototype"
        />

        <main className="ex-body">
          <Text as="h1" variant="heading3">
            Hello from the design system
          </Text>
          <Text variant="body3" color="lowEmphasis">
            Everything on this screen comes from @tiket-ds/ui. Change the guests and the total updates.
          </Text>

          <div className="ex-card">
            <Text variant="body2Bold">Guests</Text>
            <QuantityEditor value={guests} min={1} max={9} onChange={setGuests} aria-label="Guests" />
          </div>

          <div className="ex-total">
            <Text variant="body3" color="lowEmphasis">
              Total
            </Text>
            <Text variant="body1Bold">IDR {idr.format(guests * PRICE_PER_GUEST)}</Text>
          </div>
        </main>

        <footer className="ex-footer">
          <Button variant="primary" size="large" fullWidth onClick={() => setBooked(true)} disabled={booked}>
            {booked ? "Booked!" : "Book now"}
          </Button>
        </footer>
      </div>
    </TiketProvider>
  );
}
