# Human Atlas geometry attribution

The geometry in this directory is derived from **BodyParts3D 4.0**, the
adult male reference anatomy from the Database Center for Life Science
(DBCLS), licensed under **CC BY 4.0**.

- Dataset: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- License: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
- License terms: https://creativecommons.org/licenses/by/4.0/
- Source geometry: `isa_BP3D_4.0_obj_99.zip`
- English names and relationships: IS-A / PART-OF concept, element, and
  inclusion tables from the same archive.
- Publication: Mitsuhashi et al. (2009), *BodyParts3D: 3D structure database
  for anatomical concepts*, Nucleic Acids Research.
  https://doi.org/10.1093/nar/gkn613

## Adaptations in PT Brain

- Repacked the upstream 15 mixed geometry batches into **15 system-level
  chunks** (`muscular.bin.gz`, `skeletal.bin.gz`, …) so the viewer can load
  only the systems currently visible.
- Kept the upstream mesh simplification (meshoptimizer quadric
  simplification, maximum relative error 0.002) and signed-short normals.
- Reclassified seven obvious skeletal-grouped muscles (`tibialis anterior`,
  `tibialis posterior`, `fibularis longus`, `fibularis brevis`,
  `fibularis tertius`, `subscapularis`, `levator scapulae`) into the
  muscular display layer.
- Added PT Brain Vietnamese labels, descriptions, and exercise metadata for
  59 curated muscles by joining FMA IDs; the remaining source structures use
  the system-level descriptions.
- The upstream `atlas.json` concept names and source IDs are preserved.

BodyParts3D is a reference anatomy, not a complete model of every human
structure or variation. This is an educational viewer, not a diagnostic or
surgical tool.
