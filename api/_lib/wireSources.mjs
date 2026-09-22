// Inbound wire feed sources. Add/remove entries here — no DB table for
// this by design (see fieldpress-overview notes on the wire feature):
// keeping the source list in code avoids building a whole admin CRUD
// surface for something Irie can edit directly.
//
// category should match an existing FieldPress dispatch category so
// wire pressies sort/filter the same way as regular ones.

export default [
  // { name: "Local NPR Affiliate", url: "https://example.org/rss", category: "Local News" },
];
