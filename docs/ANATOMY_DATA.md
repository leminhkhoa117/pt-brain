# Dữ liệu Hệ xương & Mô liên kết cho Human Atlas 3D

> Nguồn hình học/tên cấu trúc: **BodyParts3D 4.0 + FMA** (DBCLS, CC BY 4.0).  
> Lớp tiếng Việt/chức năng/tập luyện: PT Brain biên soạn, tham chiếu **OpenStax Anatomy & Physiology** (CC BY-NC-SA 4.0, cite-only) và **Gray's Anatomy** (public domain).  
> Cập nhật: 21/11/2026.

## 1. Phạm vi

`client/public/models/human-atlas/atlas.json` có:

| Hệ | Số mảnh | Số concept |
| --- | ---: | ---: |
| Hệ xương (`skeletal`) | 282 | 253 |
| Mô liên kết (`connective`) | 40 | 62* |

\* 62 concept gồm 37 concept mô liên kết gốc + 23 đĩa đệm + 2 dải chậu chày nằm trong layer xương của nguồn.

Tổng cộng **315 concept** được resolve — script `validate:atlas-anatomy` xác nhận **0 missing**.

## 2. Cấu trúc dữ liệu

File `shared/anatomy/index.js` xuất:

```js
resolveAtlasStructure({ id, name, system }) // dùng ở client khi chọn concept
getAnatomyStructure(id)                    // server tra theo FMA, không tin client
findAnatomyByName(name)                    // fallback cho deep-link/quiz
ANATOMY_FOR_MUSCLE[slug]                   // xương/mô liên kết liên quan tới cơ
BONES, CONNECTIVE_TISSUES, ANATOMY_GROUPS
```

Mỗi entry chuẩn hóa:

```js
{
  id, kind: 'bone' | 'connective',
  vi, en, group, groupVi, region, type,
  description, functions[], training, clinical,
  attachments[], source: { label, url }, generated
}
```

- **122 entry biên soạn tay**: xương lớn, sọ/mặt, cột sống, lồng ngực, chi trên/dưới, sụn thanh quản; toàn bộ 40 mảnh mô liên kết (gân, dây chằng, cân, màng gian cốt, đĩa đệm, đường ráp, ròng rọc…).
- **193 entry sinh tên theo quy tắc**: đốt sống, sườn, sụn sườn, xương bàn tay/bàn chân, đốt ngón, răng, lợi, xương vừng — đủ để mọi mảnh trong atlas đều có nhãn Việt và mô tả cấp nhóm.
- Mỗi entry có **chức năng, ứng dụng tập luyện, lưu ý an toàn**; các xương lớn có thêm `attachments` liên kết ngược tới 59 cơ PT Brain.

## 3. Những gì đã bổ sung cho AI

Trước đây `muscleController` chỉ gửi `{ slug, vi, en, group, region }` — AI gần như chỉ biết tên cơ.

Bây giờ `shared/anatomy` + `muscleCoach` gửi:

- Tên Việt/Anh, loại cấu trúc, nhóm, vùng.
- Mô tả, danh sách chức năng.
- Với cơ: bài tập thường dùng, ghi chú kỹ thuật, mô tả nhóm cơ, xương/mô liên kết liên quan.
- Với xương/mô liên kết: ứng dụng tập luyện, lưu ý an toàn/lâm sàng, cơ liên quan trực tiếp.
- Hồ sơ người dùng: tuổi, giới, chiều cao, cân nặng, mức vận động, mục tiêu, kinh nghiệm, bệnh nền, ghi chú sức khỏe.
- Bằng chứng E1–E6 và quy tắc an toàn (không chẩn đoán/kê đơn).

Test `server/tests/anatomy.test.js` kiểm tra prompt AI có chứa mô tả/chức năng/tải tập/lưu ý an toàn, không chỉ tên.

## 4. Cách tái tạo / kiểm tra

```bash
npm --prefix client run validate:atlas-anatomy
# Atlas concepts (skeletal + connective): 315
#   curated metadata : 122
#   generated fallback: 193
#   missing           : 0
# By kind: { bone: 253, connective: 62 }
```

Script đọc trực tiếp `atlas.json`, resolve từng concept và fail (exit 1) nếu có cấu trúc không có metadata. Có thể chạy trong CI cùng `validate:atlas`.

## 5. Giới hạn

- Đây là mô hình **một nam trưởng thành**, không đại diện mọi biến thể giải phẫu/giới/tuổi.
- Mô tả là giáo dục, không thay thế chẩn đoán hoặc hình ảnh y tế.
- Tên một số cấu trúc nhỏ (răng, đốt ngón) được sinh theo quy tắc để phủ đủ atlas; phần mô tả dùng thông tin cấp nhóm thay vì bịa chi tiết riêng lẻ.
- Ranh giới phân nhóm mô liên kết/gân/cân khác nhau giữa các hệ phân loại giải phẫu.
