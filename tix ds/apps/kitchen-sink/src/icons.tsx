/*
 * The glyphs the kitchen sink passes into components, taken from the real drop in
 * `tds library/tds icon`.
 *
 * `?raw` rather than `?url`, unlike the Icons tab: an `<img>` can only ever show the
 * colour the file was exported with, and a glyph inside a component has to follow the
 * theme. Inlining the markup and swapping the baked fill for `currentColor` lets `Icon`
 * decide, so a search glyph is low-emphasis grey in light theme and near-white in dark
 * instead of vanishing into the sunken surface. It costs a handful of files' worth of
 * bundle, not a thousand.
 */

import { Icon, type IconColor } from "@tiket-ds/ui";

import searchSvg from "../../../tds library/tds icon/tds_ic_search.svg?raw";
import ovalCrossSvg from "../../../tds library/tds icon/tds_ic_oval_cross.svg?raw";
import flightDepartSvg from "../../../tds library/tds icon/tds_ic_flight_depart.svg?raw";
import flightArrivedSvg from "../../../tds library/tds icon/tds_ic_flight_arrived.svg?raw";
import calendarSvg from "../../../tds library/tds icon/tds_ic_calendar.svg?raw";
import passengerSvg from "../../../tds library/tds icon/tds_ic_passenger.svg?raw";
import seatPlanSvg from "../../../tds library/tds icon/tds_ic_seat_plan.svg?raw";
import locationSvg from "../../../tds library/tds icon/tds_ic_location.svg?raw";
import backSvg from "../../../tds library/tds icon/tds_ic_back.svg?raw";
import promoSvg from "../../../tds library/tds icon/tds_ic_discount_tag.svg?raw";
import homeOnSvg from "../../../tds library/tds icon/tds_ic_home_on.svg?raw";
import orderHistorySvg from "../../../tds library/tds icon/tds_ic_order_history.svg?raw";
import profileOffSvg from "../../../tds library/tds icon/tds_ic_profile_off.svg?raw";

/**
 * The children of the file's own `<svg>`, with every exported fill turned over to the
 * wrapping element. The outer tag is dropped rather than reused because it carries a
 * fixed `width`/`height` that would fight the size `Icon` sets.
 */
function paths(file: string): string {
  return (file.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? "").replace(
    /fill="#[0-9A-Fa-f]{3,8}"/g,
    'fill="currentColor"',
  );
}

const GLYPHS = {
  search: paths(searchSvg),
  ovalCross: paths(ovalCrossSvg),
  flightDepart: paths(flightDepartSvg),
  flightArrived: paths(flightArrivedSvg),
  calendar: paths(calendarSvg),
  passenger: paths(passengerSvg),
  seatPlan: paths(seatPlanSvg),
  location: paths(locationSvg),
  back: paths(backSvg),
  promo: paths(promoSvg),
  homeOn: paths(homeOnSvg),
  orderHistory: paths(orderHistorySvg),
  profileOff: paths(profileOffSvg),
};

export type GlyphName = keyof typeof GLYPHS;

/** Every icon in the drop is drawn on a 24px canvas; `Icon` scales it to the slot. */
const VIEW_BOX = "0 0 24 24";

export function LibraryIcon({
  name,
  size = 20,
  color = "inherit",
}: {
  name: GlyphName;
  size?: 12 | 16 | 20 | 24 | 32;
  color?: IconColor;
}) {
  return (
    <Icon size={size} color={color}>
      <svg viewBox={VIEW_BOX} dangerouslySetInnerHTML={{ __html: GLYPHS[name] }} />
    </Icon>
  );
}

export function SearchIcon() {
  return <LibraryIcon name="search" size={16} color="lowEmphasis" />;
}

export function CloseIcon() {
  return <LibraryIcon name="ovalCross" size={16} color="highEmphasis" />;
}
