# Cross-repo patches

## `imbrgr-fieldpress-embed-share.patch`

Apply against [RASvibir/imbrgr](https://github.com/RASvibir/imbrgr) `main` (or current default):

```bash
cd imbrgr
git checkout -b cursor/fieldpress-embed-share-641b
git am ../FieldPress/docs/patches/imbrgr-fieldpress-embed-share.patch
# or: git apply ../FieldPress/docs/patches/imbrgr-fieldpress-embed-share.patch
npm test -- src/lib/fieldpress*.test.ts src/lib/studio-embed.test.ts
git push -u origin HEAD
```

Adds:

- `?embed=1` compact studio + CSP `frame-ancestors` for FieldPress
- **Share with FieldPress** (postMessage when framed, else compose deep link)
- Draft id alignment with FieldPress `Fp_*` ids

This agent could not push to `RASvibir/imbrgr` (403). Apply and open the PR from a machine with write access.
