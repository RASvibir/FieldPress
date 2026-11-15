// Inbound wire feed sources. Add/remove entries here — no DB table for
// this by design (see fieldpress-overview notes on the wire feature):
// keeping the source list in code avoids building a whole admin CRUD
// surface for something Irie can edit directly.
//
// category should match an existing FieldPress dispatch category so
// wire pressies sort/filter the same way as regular ones.

const FR = "https://www.federalregister.gov/api/v1/documents.rss?conditions%5Bagencies%5D%5B%5D=";

export default [
  // Home bureau (Danville, IL) and Illinois civic news
  { name: "City of Danville", url: "https://www.cityofdanville.org/RSSFeed.aspx?ModID=1&CID=All-newsflash.xml", category: "Civic Wire" },
  { name: "Capitol News Illinois", url: "https://capitolnewsillinois.com/feed/", category: "Civic Wire" },
  { name: "Illinois Public Media Newsroom", url: "https://illinoisnewsroom.org/feed/", category: "Civic Wire" },
  // Federal Register notices (U.S. government works)
  { name: "FCC (Federal Register)", url: `${FR}federal-communications-commission`, category: "Telecom" },
  { name: "FHWA (Federal Register)", url: `${FR}federal-highway-administration`, category: "Infrastructure" },
  { name: "FTA (Federal Register)", url: `${FR}federal-transit-administration`, category: "Transit" },
  { name: "FRA (Federal Register)", url: `${FR}federal-railroad-administration`, category: "Transit" },
];
