/**
 * Registry nội dung giáo trình PT. Mỗi bài là một file riêng theo slug.
 * Thuần dữ liệu: validate schema chạy phía server (routes/curriculum.js)
 * để shared/ không kéo dependency ngoài theo quy ước của repo.
 */

import anat11 from './anat-1-1.js';
import anat12 from './anat-1-2.js';
import anat21 from './anat-2-1.js';
import anat22 from './anat-2-2.js';
import anat23 from './anat-2-3.js';
import anat24 from './anat-2-4.js';
import anat25 from './anat-2-5.js';
import anat26 from './anat-2-6.js';
import anat27 from './anat-2-7.js';
import anat28 from './anat-2-8.js';
import anat31 from './anat-3-1.js';
import anat41 from './anat-4-1.js';
import anat42 from './anat-4-2.js';
import anat51 from './anat-5-1.js';
import anat52 from './anat-5-2.js';
import phys11 from './phys-1-1.js';
import phys12 from './phys-1-2.js';
import phys21 from './phys-2-1.js';
import phys22 from './phys-2-2.js';
import phys31 from './phys-3-1.js';
import phys32 from './phys-3-2.js';
import phys41 from './phys-4-1.js';
import phys42 from './phys-4-2.js';
import phys43 from './phys-4-3.js';
import phys51 from './phys-5-1.js';
import phys52 from './phys-5-2.js';
import phys61 from './phys-6-1.js';
import nutr11 from './nutr-1-1.js';
import nutr21 from './nutr-2-1.js';
import nutr22 from './nutr-2-2.js';
import nutr23 from './nutr-2-3.js';
import nutr31 from './nutr-3-1.js';
import nutr32 from './nutr-3-2.js';
import nutr41 from './nutr-4-1.js';
import nutr51 from './nutr-5-1.js';
import nutr52 from './nutr-5-2.js';
import nutr61 from './nutr-6-1.js';
import nutr62 from './nutr-6-2.js';
import nutr63 from './nutr-6-3.js';
import nutr71 from './nutr-7-1.js';
import fit11 from './fit-1-1.js';
import fit21 from './fit-2-1.js';
import fit22 from './fit-2-2.js';
import fit31 from './fit-3-1.js';
import fit41 from './fit-4-1.js';
import fit51 from './fit-5-1.js';
import fit61 from './fit-6-1.js';
import fit62 from './fit-6-2.js';
import case11 from './case-1-1.js';
import case21 from './case-2-1.js';
import case22 from './case-2-2.js';
import case23 from './case-2-3.js';
import case24 from './case-2-4.js';
import case25 from './case-2-5.js';
import case26 from './case-2-6.js';
import case27 from './case-2-7.js';
import case28 from './case-2-8.js';
import case29 from './case-2-9.js';
import case210 from './case-2-10.js';
import rehab11 from './rehab-1-1.js';
import rehab12 from './rehab-1-2.js';
import rehab21 from './rehab-2-1.js';
import rehab22 from './rehab-2-2.js';
import rehab31 from './rehab-3-1.js';
import rehab41 from './rehab-4-1.js';
import rehab42 from './rehab-4-2.js';
import rehab51 from './rehab-5-1.js';
import rehab61 from './rehab-6-1.js';
import rehab71 from './rehab-7-1.js';
import rehab72 from './rehab-7-2.js';
import rehab81 from './rehab-8-1.js';

export const LESSONS = [
  anat11,
  anat12,
  anat21,
  anat22,
  anat23,
  anat24,
  anat25,
  anat26,
  anat27,
  anat28,
  anat31,
  anat41,
  anat42,
  anat51,
  anat52,
  phys11,
  phys12,
  phys21,
  phys22,
  phys31,
  phys32,
  phys41,
  phys42,
  phys43,
  phys51,
  phys52,
  phys61,
  nutr11,
  nutr21,
  nutr22,
  nutr23,
  nutr31,
  nutr32,
  nutr41,
  nutr51,
  nutr52,
  nutr61,
  nutr62,
  nutr63,
  nutr71,
  fit11,
  fit21,
  fit22,
  fit31,
  fit41,
  fit51,
  fit61,
  fit62,
  case11,
  case21,
  case22,
  case23,
  case24,
  case25,
  case26,
  case27,
  case28,
  case29,
  case210,
  rehab11,
  rehab12,
  rehab21,
  rehab22,
  rehab31,
  rehab41,
  rehab42,
  rehab51,
  rehab61,
  rehab71,
  rehab72,
  rehab81,
];
