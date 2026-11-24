/**
 * Kiến thức giải phẫu cho hệ xương và mô liên kết của Human Atlas 3D.
 *
 * Nguồn hình học/tên cấu trúc: BodyParts3D 4.0 + FMA (CC BY 4.0).
 * Mô tả, chức năng và ghi chú tập luyện là bản tóm tắt giáo dục do PT Brain
 * biên soạn, tham chiếu OpenStax Anatomy & Physiology (CC BY-NC-SA, cite-only)
 * và Gray's Anatomy (public domain). Không dùng để chẩn đoán.
 *
 * File này thuần dữ liệu, không import dependency, dùng được ở cả client/server.
 */

const SOURCE_BONE = {
  label: 'BodyParts3D/FMA + OpenStax Anatomy & Physiology',
  url: 'https://openstax.org/books/anatomy-and-physiology/pages/6-1-the-functions-of-the-skeletal-system',
};

const SOURCE_CONNECTIVE = {
  label: 'BodyParts3D/FMA + OpenStax Anatomy & Physiology',
  url: 'https://openstax.org/books/anatomy-and-physiology/pages/4-3-connective-tissue-supports-and-protects',
};

export const ANATOMY_KIND_LABELS = {
  bone: 'xương',
  connective: 'mô liên kết',
  muscle: 'cơ',
};

const GROUP_INFO = {
  skull: {
    vi: 'Sọ & mặt',
    region: 'Đầu & cổ',
    type: 'bone',
    description:
      'Các xương sọ và mặt tạo khung bảo vệ não, tạo khoang cho mắt – mũi – miệng và là điểm bám của cơ nhai, cơ mặt.',
    functions: [
      'Bảo vệ não, mắt và các cơ quan cảm giác trong hộp sọ.',
      'Tạo khung cho đường thở trên và bộ máy nhai – nuốt – phát âm.',
      'Là điểm bám của cơ mặt, cơ nhai và cơ cổ.',
    ],
    training: 'Không đặt tải trực tiếp như xương chi, nhưng tư thế đầu – cổ và lực cắn ảnh hưởng cơ nhai, cơ cổ.',
    clinical: 'Đau hàm, nghiến răng hoặc đau đầu vùng thái dương có thể liên quan khớp thái dương – hàm.',
  },
  spine: {
    vi: 'Cột sống',
    region: 'Thân',
    type: 'bone',
    description:
      'Cột sống gồm 24 đốt di động (7 cổ, 12 ngực, 5 thắt lưng), xương cùng và xương cụt; mỗi cấp là một phức hợp khớp – đĩa đệm.',
    functions: [
      'Nâng đỡ trọng lượng thân và truyền lực giữa chi dưới với đầu – tay.',
      'Bảo vệ tủy sống trong ống sống.',
      'Cho phép gập, duỗi, nghiêng và xoay thân.',
    ],
    training: 'Giữ cột sống trung tính khi squat/deadlift; chia tải đều thay vì gập-xoay có tải ở một điểm.',
    clinical: 'Nén kết hợp xoay là tổ hợp tải bất lợi cho đĩa đệm; đau lan xuống chân kèm tê/yếu cần khám chuyên khoa.',
  },
  thorax: {
    vi: 'Lồng ngực',
    region: 'Thân',
    type: 'bone',
    description:
      'Lồng ngực gồm xương ức, 12 cặp sườn và sụn sườn, tạo khoang bảo vệ tim – phổi và tham gia cơ học thở.',
    functions: [
      'Bảo vệ tim, phổi và mạch máu lớn.',
      'Thay đổi thể tích lồng ngực khi thở nhờ cơ hoành và cơ liên sườn.',
      'Là điểm bám của cơ ngực, cơ lưng và cơ bụng.',
    ],
    training: 'Thở 360° và giữ lồng ngực mở giúp ổn định thân; tránh nín thở gắng sức ở người có bệnh tim mạch.',
    clinical: 'Đau ngực khi gắng sức, khó thở hoặc đau sau chấn thương cần loại trừ nguyên nhân tim – phổi trước khi tập.',
  },
  shoulder: {
    vi: 'Đai vai',
    region: 'Vai',
    type: 'bone',
    description:
      'Đai vai gồm xương đòn và xương bả vai. Bả vai trượt trên lồng ngực nhờ cơ, tạo nền linh hoạt cho khớp vai.',
    functions: [
      'Nối chi trên với thân qua xương đòn.',
      'Tạo ổ chảo nông cho chỏm xương cánh tay và cho phép biên độ vai rất lớn.',
      'Là điểm bám của chỏm xoay, cơ thang, cơ răng trước và cơ delta.',
    ],
    training: 'Tập kiểm soát bả vai (nâng – khép – xoay) trước khi tăng tải đẩy qua đầu; giữ vai không nhún khi đẩy.',
    clinical: 'Bả vai nhô ra trước và xoay xuống kéo dài có thể liên quan đau vai dưới vòm; cần đánh giá cả cổ và ngực.',
  },
  'upper-limb': {
    vi: 'Chi trên',
    region: 'Tay',
    type: 'bone',
    description:
      'Xương chi trên gồm xương cánh tay, quay, trụ, xương cổ tay, bàn tay và đốt ngón; phối hợp tạo lực nắm và độ khéo.',
    functions: [
      'Tạo đòn bẩy cho cơ vai – tay – cẳng tay.',
      'Cho phép gấp/duỗi, sấp/ngửa và các chuyển động tinh tế của bàn tay.',
      'Truyền lực từ thân ra tay khi đẩy, kéo, nâng.',
    ],
    training: 'Giữ cổ tay trung tính khi đẩy/kéo; tăng dần tải nắm và bài treo nếu không đau.',
    clinical: 'Ngã chống tay có thể gây gãy xương thuyền hoặc xương quay xa; đau cổ tay kéo dài cần khám.',
  },
  pelvis: {
    vi: 'Chậu & hông',
    region: 'Hông & chậu',
    type: 'bone',
    description:
      'Vòng chậu gồm hai xương hông và xương cùng, tạo ổ chậu sâu và truyền lực giữa thân với chi dưới.',
    functions: [
      'Truyền trọng lượng từ cột sống xuống chân khi đứng, đi, chạy.',
      'Tạo ổ chậu sâu cho khớp hông chịu tải lớn.',
      'Là điểm bám của cơ mông, cơ khép, cơ bụng và sàn chậu.',
    ],
    training: 'Tập hông hinge và kiểm soát chậu trước khi squat nặng; giữ chậu trung tính khi đẩy tạ.',
    clinical: 'Đau vùng chậu sau hoặc bẹn kéo dài cần phân biệt khớp cùng chậu, gân cơ khép và ổ chậu.',
  },
  'lower-limb': {
    vi: 'Chi dưới',
    region: 'Chân',
    type: 'bone',
    description:
      'Xương chi dưới gồm xương đùi, bánh chè, chày, mác, xương bàn chân và đốt ngón; chịu tải trọng lớn khi đứng và di chuyển.',
    functions: [
      'Chịu và truyền lực từ thân xuống bàn chân.',
      'Tạo đòn bẩy cho cơ mông, cơ đùi và cơ cẳng chân.',
      'Tạo các vòm bàn chân hấp thu lực khi bước/chạy.',
    ],
    training: 'Squat, deadlift, lunge, calf raise và đi bộ nhanh đều tạo tín hiệu tải cho xương chân; tăng volume từ từ.',
    clinical: 'Đau điểm cố định trên xương chày khi chạy tăng dần có thể là nứt ứng suất; dừng tăng tải và khám.',
  },
  cartilage: {
    vi: 'Sụn',
    region: 'Khớp & đường thở',
    type: 'cartilage',
    description:
      'Sụn là mô liên kết đặc, dai, ít mạch máu; sụn khớp giảm ma sát và phân bố lực, sụn trong giữ hình dạng đường thở.',
    functions: [
      'Giảm ma sát và hấp thu lực ở mặt khớp.',
      'Giữ mở đường thở (khí quản, thanh quản).',
      'Tạo khung đàn hồi cho một số cấu trúc (mũi, tai).',
    ],
    training: 'Sụn khớp thích ứng với tải vừa phải và chuyển động đều; tránh tăng đột ngột cả tải và biên độ.',
    clinical: 'Sụn ít mạch nên chậm lành; đau khớp kèm sưng, kẹt hoặc mất biên độ cần đánh giá chuyên khoa.',
  },
  teeth: {
    vi: 'Răng & lợi',
    region: 'Đầu & cổ',
    type: 'bone',
    description:
      'Răng và lợi thuộc bộ máy nhai; răng truyền lực cắn xuống xương hàm, lợi giữ chân răng và niêm mạc miệng.',
    functions: [
      'Nghiền thức ăn, hỗ trợ tiêu hóa cơ học.',
      'Tham gia phát âm và thẩm mỹ khuôn mặt.',
      'Truyền lực cắn qua dây chằng nha chu xuống xương hàm.',
    ],
    training: 'Không có bài tập trực tiếp; kiểm soát nghiến răng khi gắng sức và giữ vệ sinh răng miệng.',
    clinical: 'Đau răng hoặc khớp thái dương – hàm khi tập nặng nên được kiểm tra nha khoa.',
  },
  sesamoid: {
    vi: 'Xương vừng',
    region: 'Bàn chân',
    type: 'bone',
    description:
      'Xương vừng là xương nhỏ nằm trong gân, thường gặp ở dưới đầu xương bàn chân cái; giúp đổi hướng lực gân và bảo vệ gân.',
    functions: [
      'Tăng hiệu quả đòn bẩy của gân cơ gấp ngón cái.',
      'Giảm áp lực trực tiếp lên gân khi đẩy mũi chân.',
      'Ổn định cơ học vùng đầu xương bàn chân thứ nhất.',
    ],
    training: 'Kiểm soát đẩy mũi chân khi chạy/nhảy; tăng dần tải và chọn giày phù hợp.',
    clinical: 'Viêm hoặc gãy xương vừng gây đau dưới đầu xương bàn chân cái khi đi/đẩy mũi chân.',
  },
  larynx: {
    vi: 'Thanh quản',
    region: 'Cổ',
    type: 'cartilage',
    description:
      'Thanh quản gồm các sụn và dây chằng nối với xương móng; điều chỉnh đường thở, nuốt và phát âm.',
    functions: [
      'Giữ đường thở mở và bảo vệ đường thở khi nuốt.',
      'Căng/khép dây thanh để phát âm.',
      'Phối hợp với cơ vùng cổ – hầu khi thở gắng sức.',
    ],
    training: 'Thở bằng mũi, giữ cổ mềm; không siết cổ khi gắng sức.',
    clinical: 'Khàn tiếng, khó thở hoặc đau khi nuốt kéo dài cần khám tai mũi họng.',
  },
  ligament: {
    vi: 'Dây chằng',
    region: 'Khớp',
    type: 'ligament',
    description:
      'Dây chằng nối xương với xương, giới hạn chuyển động quá mức và cung cấp cảm giác vị trí cho khớp.',
    functions: [
      'Giữ ổn định khớp trong biên độ sinh lý.',
      'Hạn chế chuyển động dịch chuyển quá mức.',
      'Truyền tín hiệu cảm giác về vị trí và tải của khớp.',
    ],
    training: 'Tăng sức mạnh cơ quanh khớp và kiểm soát biên độ giúp giảm tải cho dây chằng; tránh kéo giãn mạnh khi đang đau cấp.',
    clinical: 'Đau sau chấn thương kèm lỏng khớp, sưng nhanh hoặc không chịu tải cần khám và chẩn đoán hình ảnh khi cần.',
  },
  tendon: {
    vi: 'Gân',
    region: 'Cơ – xương',
    type: 'tendon',
    description:
      'Gân là mô liên kết dai nối cơ với xương, truyền lực co cơ thành chuyển động và lưu trữ năng lượng đàn hồi.',
    functions: [
      'Truyền lực từ cơ sang xương.',
      'Lưu trữ và giải phóng năng lượng đàn hồi khi chạy/nhảy.',
      'Ổn định khớp nhờ lực căng thụ động.',
    ],
    training: 'Gân thích ứng với tải chậm và đều: tăng dần, giữ thời gian dưới căng, tập eccentric nếu phù hợp.',
    clinical: 'Đau gân thường cục bộ, tăng khi tải và giảm khi khởi động; đau kéo dài cần tiến trình tải có kiểm soát.',
  },
  membrane: {
    vi: 'Màng liên kết',
    region: 'Cẳng tay & cẳng chân',
    type: 'membrane',
    description:
      'Màng gian cốt nối hai xương song song, chia khoang cơ và truyền lực giữa xương quay – trụ hoặc chày – mác.',
    functions: [
      'Nối và giữ khoảng cách giữa hai xương.',
      'Tạo diện bám cho cơ và mạch máu.',
      'Truyền lực từ xương này sang xương kia.',
    ],
    training: 'Giữ trục cẳng tay/cẳng chân ổn định khi đẩy, kéo và đổi hướng; không cần bài tập riêng cho màng.',
    clinical: 'Đau sâu giữa cẳng tay/cẳng chân sau chấn thương xoay có thể liên quan màng gian cốt; cần đánh giá.',
  },
  fascia: {
    vi: 'Cân & mô liên kết sợi',
    region: 'Toàn thân',
    type: 'fascia',
    description:
      'Cân là mô liên kết sợi bao bọc cơ, nối các lớp mô và truyền lực giữa cơ – xương – da; một số dải cân đóng vai trò ổn định lớn.',
    functions: [
      'Bao bọc và tách các khoang cơ.',
      'Truyền lực giữa các cấu trúc và ổn định khớp.',
      'Chứa cảm giác và tham gia trượt giữa các lớp mô.',
    ],
    training: 'Chuyển động đa dạng và tải tăng dần giúp cân thích ứng; tránh lăn ép mạnh lên vùng đang viêm cấp.',
    clinical: 'Đau cân thường lan theo dải, thay đổi theo tải và tư thế; cần phân biệt với đau khớp/gân.',
  },
  disc: {
    vi: 'Đĩa đệm',
    region: 'Cột sống',
    type: 'fibrocartilage',
    description:
      'Đĩa đệm nằm giữa hai thân đốt sống, gồm vòng sợi bên ngoài và nhân nhầy bên trong; hấp thu lực nén và cho phép chuyển động nhỏ giữa các đốt.',
    functions: [
      'Hấp thu và phân bố lực nén dọc trục.',
      'Cho phép gập/duỗi/nghiêng/xoay giữa các đốt.',
      'Giữ khoảng cách giữa hai thân đốt để bảo vệ lỗ thần kinh.',
    ],
    training: 'Giữ cột sống trung tính khi nâng tạ; tránh gập-xoay có tải đột ngột; tăng dần tải theo thời gian.',
    clinical: 'Thoát vị đĩa đệm có thể chèn rễ thần kinh gây đau lan, tê hoặc yếu chân — cần khám chuyên khoa.',
  },
  raphe: {
    vi: 'Đường ráp',
    region: 'Đầu – cổ – thân',
    type: 'raphe',
    description:
      'Đường ráp là dải mô liên kết nơi hai cơ hoặc hai lớp mô gặp nhau, tạo điểm bám giữa và ổn định đường giữa.',
    functions: [
      'Tạo điểm bám giữa cho các cơ đối xứng.',
      'Ổn định đường giữa của thân hoặc vùng hầu.',
      'Truyền lực giữa các cơ cùng vùng.',
    ],
    training: 'Duy trì tư thế đầu – cổ trung tính và thở đều khi gắng sức; không có bài tập riêng cho đường ráp.',
    clinical: 'Căng hoặc đau vùng đường ráp thường liên quan tư thế và tăng tải; đau kéo dài cần đánh giá chuyên khoa.',
  },
  skeleton: {
    vi: 'Hệ xương',
    region: 'Toàn thân',
    type: 'bone',
    description:
      'Xương là mô sống liên tục tái tạo theo tín hiệu tải cơ học; khung xương nâng đỡ, bảo vệ và tạo đòn bẩy cho cơ.',
    functions: [
      'Nâng đỡ trọng lượng và giữ hình dạng cơ thể.',
      'Bảo vệ cơ quan nội tạng.',
      'Tạo đòn bẩy cho cơ và dự trữ khoáng.',
    ],
    training: 'Tải cơ học hợp lý (kháng lực, tác động gánh trọng lực) là tín hiệu duy trì mật độ xương; tăng từ từ theo tháng.',
    clinical: 'Đau xương cục bộ tăng dần khi tải, đặc biệt ở người lớn tuổi hoặc chạy nhiều, cần loại trừ nứt ứng suất.',
  },
};

function groupInfo(key) {
  return GROUP_INFO[key] || GROUP_INFO.skeleton;
}

function makeEntry({
  id,
  kind = 'bone',
  vi,
  en,
  group = 'skeleton',
  type,
  region,
  description,
  functions,
  training,
  clinical,
  attachments = [],
}) {
  const info = groupInfo(group);
  return {
    id,
    kind,
    vi,
    en,
    group,
    groupVi: info.vi,
    region: region || info.region,
    type: type || info.type,
    description: description || info.description,
    functions: functions || info.functions,
    training: training || info.training,
    clinical: clinical || info.clinical,
    attachments,
    source: kind === 'bone' ? SOURCE_BONE : SOURCE_CONNECTIVE,
    generated: false,
  };
}

/** Các xương lớn/ có ý nghĩa tập luyện, map theo FMA ID (trái và phải). */
const BONE_ENTRIES = {};

function addBones(ids, vi, en, group, extra = {}) {
  const list = [].concat(ids);
  list.forEach((id, index) => {
    // Các cặp xương trái/phải dùng chung metadata; thêm bên để panel/search rõ ràng.
    const side = list.length === 2 ? (index === 0 ? ' bên phải' : ' bên trái') : '';
    BONE_ENTRIES[id] = makeEntry({ id, kind: 'bone', vi: `${vi}${side}`, en, group, ...extra });
  });
}

addBones(
  ['FMA24474', 'FMA24475'],
  'Xương đùi',
  'Femur',
  'lower-limb',
  {
    description:
      'Xương dài và chắc nhất cơ thể, nối khớp hông với khớp gối. Mỏm chuyển lớn là điểm bám của cơ mông và dải chậu chày.',
    functions: [
      'Chịu và truyền lực từ thân xuống chân.',
      'Tạo đòn bẩy cho cơ mông, cơ tứ đầu đùi và nhóm hamstring.',
      'Là mốc xương quan trọng khi đánh giá trục chi dưới.',
    ],
    training: 'Squat, deadlift, lunge và hip hinge đều đặt tải lên xương đùi; tăng tải từ từ để xương thích ứng.',
    clinical:
      'Gãy cổ xương đùi thường gặp ở người lớn tuổi; đau mặt ngoài hông khi nằm nghiêng có thể liên quan mỏm chuyển lớn/dải chậu chày.',
    attachments: ['gluteus-maximus', 'quadriceps', 'biceps-femoris', 'adductor-magnus', 'psoas-major'],
  },
);

addBones(['FMA24477', 'FMA24478'], 'Xương chày', 'Tibia', 'lower-limb', {
  description:
    'Xương chịu lực chính của cẳng chân, nối khớp gối với cổ chân; mặt trước xương chày nằm ngay dưới da nên dễ va chạm.',
  functions: [
    'Truyền phần lớn trọng lượng từ gối xuống bàn chân.',
    'Tạo diện khớp với xương đùi và xương sên.',
    'Là điểm bám của cơ tứ đầu đùi, cơ cẳng chân và cơ chày trước.',
  ],
  training: 'Squat, step-up và chạy đặt tải dọc trục lên chày; tăng volume chạy không quá nhanh.',
  clinical: 'Đau điểm cố định mặt trong chày khi chạy tăng dần có thể là nứt ứng suất — cần giảm tải và khám.',
  attachments: ['quadriceps', 'gastrocnemius', 'soleus', 'tibialis-anterior', 'tibialis-posterior'],
});

addBones(['FMA24480', 'FMA24481'], 'Xương mác', 'Fibula', 'lower-limb', {
  description:
    'Xương mảnh ở mặt ngoài cẳng chân, không chịu lực dọc trục chính nhưng tạo khớp sên mác và là điểm bám của cơ mác.',
  functions: [
    'Ổn định mặt ngoài cổ chân qua khớp sên mác.',
    'Tạo điểm bám cho cơ mác dài/ngắn và một phần cơ chày sau.',
    'Tham gia tạo khoang cẳng chân cùng màng gian cốt.',
  ],
  training: 'Tập cơ mác và giữ thăng bằng một chân để hỗ trợ ổn định cổ chân.',
  clinical: 'Bong gân cổ chân nặng có thể kèm tổn thương khớp sên mác hoặc gãy mắt cá ngoài.',
  attachments: ['fibularis-longus', 'fibularis-brevis', 'tibialis-posterior', 'soleus', 'extensor-digitorum-longus'],
});

addBones(['FMA24486', 'FMA24487'], 'Xương bánh chè', 'Patella', 'lower-limb', {
  description:
    'Xương vừng lớn nhất cơ thể, nằm trong gân tứ đầu đùi trước khớp gối; tăng hiệu quả đòn bẩy khi duỗi gối.',
  functions: [
    'Tăng mô-men duỗi gối của cơ tứ đầu đùi.',
    'Bảo vệ mặt trước khớp gối.',
    'Dẫn hướng lực gân tứ đầu qua rãnh bánh chè.',
  ],
  training: 'Kiểm soát hướng gối theo ngón chân khi squat/lunge; tăng dần độ sâu và tải.',
  clinical: 'Đau quanh bánh chè khi squat, leo cầu thang hoặc ngồi lâu thường liên quan tải lặp và kiểm soát hông/cổ chân.',
  attachments: ['quadriceps'],
});

addBones(['FMA23130', 'FMA23131'], 'Xương cánh tay', 'Humerus', 'upper-limb', {
  description:
    'Xương dài của cánh tay, nối chỏm với ổ chảo xương bả vai và đầu dưới với xương quay – trụ tại khuỷu.',
  functions: [
    'Tạo đòn bẩy cho cơ delta, cơ ngực lớn, cơ lưng rộng và cơ tay.',
    'Truyền lực từ thân ra tay khi đẩy/kéo.',
    'Tạo khớp vai và khớp khuỷu.',
  ],
  training: 'Giữ chỏm xương cánh tay ổn định trong ổ chảo khi đẩy; kiểm soát vai và bả vai trước khi tăng tải qua đầu.',
  clinical: 'Đau vai khi giơ tay có thể liên quan chỏm xoay; gãy xương cánh tay thường sau chấn thương mạnh.',
  attachments: ['deltoid', 'biceps-brachii', 'triceps-brachii', 'pectoralis-major', 'latissimus-dorsi', 'supraspinatus', 'infraspinatus', 'subscapularis', 'teres-minor'],
});

addBones(['FMA23464', 'FMA23465'], 'Xương quay', 'Radius', 'upper-limb', {
  description:
    'Xương phía ngón cái của cẳng tay; xoay quanh xương trụ để tạo sấp/ngửa và tạo khớp cổ tay chính.',
  functions: [
    'Cho phép sấp/ngửa cẳng tay.',
    'Tạo mặt khớp cổ tay với xương thuyền và xương nguyệt.',
    'Là điểm bám của cơ nhị đầu, cơ ngửa và nhiều cơ cẳng tay.',
  ],
  training: 'Đổi tay cầm (neutral/palm-up/palm-down) để phân bố lực giữa các cơ; giữ cổ tay trung tính khi đẩy.',
  clinical: 'Ngã chống tay có thể gãy đầu dưới xương quay; đau cổ tay phía ngón cái cần đánh giá gân De Quervain.',
  attachments: ['biceps-brachii', 'brachioradialis', 'supinator', 'pronator-quadratus', 'flexor-carpi-radialis'],
});

addBones(['FMA23467', 'FMA23468'], 'Xương trụ', 'Ulna', 'upper-limb', {
  description:
    'Xương phía ngón út của cẳng tay, tạo khớp bản lề khuỷu với ròng rọc xương cánh tay và ổn định cổ tay phía trụ.',
  functions: [
    'Tạo trục gấp/duỗi của khuỷu.',
    'Là điểm bám của cơ tam đầu, cơ khuỷu và nhiều cơ cẳng tay.',
    'Ổn định mặt trụ của cổ tay.',
  ],
  training: 'Giữ khuỷu gần thân khi đẩy nặng; kiểm soát cổ tay khi kéo/row.',
  clinical: 'Đau mặt trong khuỷu khi ném/đẩy có thể liên quan gân cơ gấp cổ tay hoặc dây chằng bên trụ.',
  attachments: ['triceps-brachii', 'flexor-carpi-ulnaris', 'extensor-carpi-ulnaris', 'finger-flexors'],
});

addBones(['FMA13395', 'FMA13396'], 'Xương bả vai', 'Scapula', 'shoulder', {
  description:
    'Xương dẹt nằm sau lồng ngực, trượt trên lồng ngực nhờ cơ; ổ chảo nông là nền của khớp vai linh hoạt.',
  functions: [
    'Tạo ổ chảo nông cho chỏm xương cánh tay.',
    'Cho phép nâng – khép – xoay bả vai để mở biên độ vai.',
    'Là điểm bám của chỏm xoay, cơ thang, cơ răng trước và cơ delta.',
  ],
  training: 'Tập nâng/khép/xoay bả vai và cơ răng trước trước khi đẩy qua đầu; không nhún vai khi đẩy.',
  clinical: 'Bả vai nhô trước, xoay xuống kéo dài có thể liên quan đau vai dưới vòm; đau vai kèm tê tay cần đánh giá cổ.',
  attachments: ['deltoid', 'trapezius', 'rhomboid-major', 'serratus-anterior', 'levator-scapulae', 'supraspinatus', 'infraspinatus', 'subscapularis', 'teres-minor', 'teres-major'],
});

addBones(['FMA13322', 'FMA13323'], 'Xương đòn', 'Clavicle', 'shoulder', {
  description:
    'Xương nối xương ức với mỏm cùng vai, tạo thanh chống giữ vai ra ngoài và truyền lực từ tay về thân.',
  functions: [
    'Giữ vai ở vị trí ngoài, tạo không gian cho cơ và mạch máu.',
    'Truyền lực từ chi trên về thân.',
    'Là điểm bám của cơ thang, cơ delta và cơ ngực lớn.',
  ],
  training: 'Giữ vai hạ và hơi khép khi đẩy; tập cơ thang dưới và cơ răng trước để ổn định đai vai.',
  clinical: 'Gãy xương đòn thường sau ngã; đau khớp cùng vai – đòn khi giơ tay có thể liên quan viêm khớp.',
  attachments: ['trapezius', 'deltoid', 'pectoralis-major', 'sternocleidomastoid'],
});

addBones(['FMA16586', 'FMA16587'], 'Xương hông', 'Hip bone', 'pelvis', {
  description:
    'Xương hông gồm phần cánh chậu, xương ngồi và xương mu hợp nhất; tạo ổ chậu sâu cho khớp hông và vòng chậu.',
  functions: [
    'Tạo ổ chậu cho chỏm xương đùi.',
    'Truyền trọng lượng giữa cột sống và chân.',
    'Là điểm bám của cơ mông, cơ khép, cơ bụng và sàn chậu.',
  ],
  training: 'Tập hip hinge, squat và kiểm soát chậu; giữ chậu trung tính khi đẩy tạ.',
  clinical: 'Đau bẹn hoặc mông sâu kéo dài cần phân biệt khớp hông, gân cơ khép và khớp cùng chậu.',
  attachments: ['gluteus-maximus', 'gluteus-medius', 'gluteus-minimus', 'iliacus', 'psoas-major', 'obturator-internus', 'adductor-longus', 'adductor-brevis', 'adductor-magnus', 'rectus-abdominis'],
});

addBones('FMA16202', 'Xương cùng', 'Sacrum', 'pelvis', {
  description:
    'Năm đốt sống cùng hợp nhất thành một xương hình nêm, nằm giữa hai xương hông; truyền lực từ cột sống xuống chậu.',
  functions: [
    'Truyền trọng lượng thân xuống vòng chậu và chi dưới.',
    'Tạo thành ống cùng và các lỗ cùng cho rễ thần kinh.',
    'Là điểm bám mạnh của dây chằng cùng chậu và cơ mông.',
  ],
  training: 'Giữ kiểm soát chậu khi squat/deadlift; tập cơ mông và cơ sàn chậu nếu có yếu.',
  clinical: 'Đau cùng chậu sau sinh hoặc sau chấn thương cần đánh giá khớp cùng chậu và dây chằng.',
  attachments: ['gluteus-maximus', 'erector-spinae'],
});

addBones(['FMA24497', 'FMA24498'], 'Xương gót', 'Calcaneus', 'lower-limb', {
  description:
    'Xương lớn nhất của bàn chân, tạo gót và truyền lực từ xương sên xuống nền; gân gót bám vào củ gót.',
  functions: [
    'Chịu lực va chạm khi đặt gót.',
    'Tạo đòn bẩy cho gân gót khi đẩy mũi chân.',
    'Tạo vòm dọc bàn chân cùng các xương và dây chằng khác.',
  ],
  training: 'Calf raise, đi bộ và chạy tăng dần; kiểm soát đáp gót khi chạy để giảm tải gân gót.',
  clinical: 'Đau gót buổi sáng có thể liên quan cân gan chân; đau gân gót khi đẩy mũi chân cần tiến trình tải.',
  attachments: ['gastrocnemius', 'soleus', 'flexor-digitorum-brevis'],
});

addBones(['FMA24482', 'FMA24483'], 'Xương sên', 'Talus', 'lower-limb', {
  description:
    'Xương sên nối xương chày với xương gót và xương thuyền; truyền lực từ cẳng chân xuống bàn chân qua khớp cổ chân.',
  functions: [
    'Truyền lực giữa cẳng chân và bàn chân.',
    'Cho phép gấp/duỗi cổ chân.',
    'Tạo khớp dưới sên với xương gót và xương thuyền.',
  ],
  training: 'Tập gấp/duỗi cổ chân đủ biên độ và kiểm soát thăng bằng một chân.',
  clinical: 'Đau cổ chân sau bong gân hoặc chấn thương nén có thể liên quan xương sên; cần đánh giá nếu đau kéo dài.',
});

addBones(['FMA24500', 'FMA24501'], 'Xương thuyền', 'Navicular bone', 'lower-limb', {
  description: 'Xương thuyền nằm giữa xương sên và xương chêm, góp phần tạo vòm dọc bàn chân.',
  functions: ['Truyền lực từ xương sên xuống xương chêm.', 'Tạo điểm bám cho cơ chày sau.', 'Ổn định vòm dọc trong.'],
  training: 'Tập cơ chày sau và bài short foot để hỗ trợ vòm bàn chân.',
  clinical: 'Đau vòm trong kéo dài có thể liên quan gân chày sau hoặc xương thuyền phụ.',
  attachments: ['tibialis-posterior'],
});

addBones(['FMA24528', 'FMA24529'], 'Xương hộp', 'Cuboid bone', 'lower-limb', {
  description: 'Xương hộp nằm phía ngoài bàn chân, giữa xương gót và xương bàn chân thứ tư – năm; góp phần ổn định vòm ngang.',
  functions: ['Truyền lực phía ngoài bàn chân.', 'Tạo ròng rọc cho gân cơ mác dài.', 'Ổn định vòm ngang.'],
  training: 'Tập cơ mác và kiểm soát thăng bằng để ổn định mặt ngoài bàn chân.',
  clinical: 'Đau mặt ngoài bàn chân sau bong gân hoặc chấn thương nén cần đánh giá.',
  attachments: ['fibularis-longus', 'fibularis-brevis'],
});

addBones(['FMA24521', 'FMA24522'], 'Xương chêm trong', 'Medial cuneiform', 'lower-limb');
addBones(['FMA24523', 'FMA24524'], 'Xương chêm giữa', 'Intermediate cuneiform', 'lower-limb');
addBones(['FMA24525', 'FMA24526'], 'Xương chêm ngoài', 'Lateral cuneiform', 'lower-limb');

addBones(['FMA24435', 'FMA24436'], 'Xương thuyền cổ tay', 'Scaphoid', 'upper-limb', {
  description: 'Xương thuyền cổ tay nằm phía ngón cái, nối hàng xương cổ tay gần với xương quay; nguồn máu nuôi hạn chế nên dễ chậm lành.',
  functions: ['Truyền lực từ xương quay xuống bàn tay.', 'Cho phép cổ tay gấp/duỗi và nghiêng quay – trụ.', 'Ổn định hàng xương cổ tay gần.'],
  training: 'Tăng dần tải chống đỡ cổ tay; tránh đẩy mạnh khi cổ tay còn đau sau ngã.',
  clinical: 'Ngã chống tay đau vùng cổ tay phía ngón cái, đặc biệt ấn vào hố lào, cần loại trừ gãy xương thuyền.',
});
addBones(['FMA24437', 'FMA24438'], 'Xương nguyệt', 'Lunate', 'upper-limb', {
  description: 'Xương nguyệt nằm giữa hàng xương cổ tay gần, tạo khớp với xương quay và xương thuyền; có thể bị thiếu máu nuôi sau chấn thương.',
  functions: ['Phân bố lực giữa xương quay và cổ tay.', 'Cho phép gấp/duỗi cổ tay.', 'Ổn định trục giữa cổ tay.'],
  clinical: 'Đau cổ tay trung tâm kéo dài sau chấn thương cần đánh giá hoại tử vô mạch xương nguyệt.',
});
addBones(['FMA24439', 'FMA24440'], 'Xương ba cạnh', 'Triquetral', 'upper-limb');
addBones(['FMA24441', 'FMA24442'], 'Xương đậu', 'Pisiform', 'upper-limb');
addBones(['FMA24443', 'FMA24444'], 'Xương thang', 'Trapezium', 'upper-limb');
addBones(['FMA23725', 'FMA24445'], 'Xương thang nhỏ', 'Trapezoid', 'upper-limb');
addBones(['FMA24446', 'FMA24447'], 'Xương cả', 'Capitate', 'upper-limb');
addBones(['FMA24448', 'FMA24449'], 'Xương móc', 'Hamate', 'upper-limb');

addBones('FMA12519', 'Đốt đội (C1)', 'Atlas', 'spine', {
  description: 'Đốt sống cổ thứ nhất, không có thân đốt; khớp với xương chẩm để gật đầu và với đốt trục để xoay đầu.',
  functions: ['Nâng đỡ hộp sọ.', 'Cho phép gật đầu ở khớp chẩm – đội.', 'Cho phép xoay đầu quanh đốt trục.'],
  training: 'Giữ cổ trung tính khi gắng sức; tránh kéo cổ quá mức hoặc tư thế đầu ngửa mạnh khi có chóng mặt/tê tay.',
  clinical: 'Chấn thương vùng cổ sau tai nạn cần cố định và khám ngay; không tự nắn chỉnh.',
});
addBones('FMA12520', 'Đốt trục (C2)', 'Axis', 'spine', {
  description: 'Đốt sống cổ thứ hai có mỏm răng; mỏm răng khớp với đốt đội tạo trục xoay đầu.',
  functions: ['Tạo trục xoay cho đầu.', 'Ổn định khớp đội – trục bằng dây chằng.', 'Nâng đỡ hộp sọ.'],
  training: 'Tránh tư thế cổ quá ưỡn khi tập nặng; giữ cằm hơi thu và cổ dài.',
  clinical: 'Đau cổ kèm chóng mặt, nhìn đôi hoặc tê tay cần khám chuyên khoa.',
});
addBones('FMA52734', 'Xương trán', 'Frontal bone', 'skull');
addBones(['FMA52788', 'FMA52789'], 'Xương đỉnh', 'Parietal bone', 'skull');
addBones(['FMA52738', 'FMA52739'], 'Xương thái dương', 'Temporal bone', 'skull');
addBones('FMA52735', 'Xương chẩm', 'Occipital bone', 'skull');
addBones('FMA52736', 'Xương bướm', 'Sphenoid bone', 'skull');
addBones('FMA52740', 'Xương sàng', 'Ethmoid', 'skull');
addBones(['FMA53649', 'FMA53650'], 'Xương hàm trên', 'Maxilla', 'skull');
addBones('FMA52748', 'Xương hàm dưới', 'Mandible', 'skull', {
  description: 'Xương hàm dưới di động duy nhất của hộp sọ, khớp với xương thái dương ở khớp thái dương – hàm; là điểm bám của cơ nhai.',
  functions: ['Tạo khung hàm dưới và chứa răng dưới.', 'Tham gia nhai, nuốt, phát âm.', 'Tạo mốc cho khớp thái dương – hàm.'],
  training: 'Kiểm soát nghiến răng khi gắng sức; thả lỏng hàm giữa các set.',
  clinical: 'Đau khớp thái dương – hàm, tiếng click hoặc hạn chế mở miệng nên khám nha khoa/chuyên khoa hàm mặt.',
});
addBones('FMA52749', 'Xương móng', 'Hyoid bone', 'skull', {
  description: 'Xương móng nằm ở cổ, không khớp trực tiếp với xương khác; là điểm bám của cơ lưỡi, cơ hầu và cơ cổ.',
  functions: ['Nâng đỡ lưỡi và thanh quản.', 'Phối hợp nuốt và phát âm.', 'Là mốc treo của cơ vùng cổ.'],
  training: 'Giữ cổ mềm, thở đều; không siết cổ khi gắng sức.',
  clinical: 'Đau vùng móng khi nuốt hoặc chấn thương cổ cần khám.',
});
addBones(['FMA53647', 'FMA53648'], 'Xương mũi', 'Nasal bone', 'skull');
addBones(['FMA52892', 'FMA52893'], 'Xương gò má', 'Zygomatic bone', 'skull');
addBones(['FMA53655', 'FMA53656'], 'Xương khẩu cái', 'Palatine bone', 'skull');
addBones('FMA9710', 'Xương lá mía', 'Vomer', 'skull');
addBones('FMA7486', 'Cán xương ức', 'Manubrium', 'thorax');
addBones('FMA7487', 'Thân xương ức', 'Body of sternum', 'thorax');
addBones('FMA7488', 'Mỏm ức', 'Xiphoid process', 'thorax', {
  description: 'Mỏm ức là phần dưới cùng của xương ức, thường hóa sụn ở người trưởng thành; là mốc giải phẫu quan trọng khi ép tim.',
  functions: ['Là điểm bám của cơ hoành và cơ bụng.', 'Hoàn thiện khung trước lồng ngực.', 'Là mốc định vị khi hồi sinh tim phổi.'],
  training: 'Không ấn mạnh trực tiếp vào mỏm ức; đặt tay ép tim đúng vị trí khi cần.',
  clinical: 'Đau mỏm ức sau va chạm hoặc sau tập bụng nhiều có thể do viêm khớp ức – sườn; đau ngực cấp cần loại trừ tim.',
});

// Sụn thanh quản và sụn cánh mũi
addBones('FMA55099', 'Sụn giáp', 'Thyroid cartilage', 'larynx', { type: 'cartilage' });
addBones('FMA9615', 'Sụn nhẫn', 'Cricoid cartilage', 'larynx', { type: 'cartilage' });
addBones(['FMA55113', 'FMA55114'], 'Sụn phễu', 'Arytenoid cartilage', 'larynx', { type: 'cartilage' });
addBones(['FMA55115', 'FMA55116'], 'Sụn sừng', 'Corniculate cartilage', 'larynx', { type: 'cartilage' });
addBones(['FMA55117', 'FMA55118'], 'Sụn chêm', 'Cuneiform cartilage', 'larynx', { type: 'cartilage' });
addBones(['FMA59505', 'FMA59506'], 'Sụn cánh mũi lớn', 'Major alar cartilage', 'skull', { type: 'cartilage' });

const CONNECTIVE_ENTRIES = {};

function addConnective(ids, vi, en, group, type, extra = {}) {
  for (const id of [].concat(ids)) {
    CONNECTIVE_ENTRIES[id] = makeEntry({
      id,
      kind: 'connective',
      vi,
      en,
      group,
      type,
      ...extra,
    });
  }
}

addConnective('FMA46442', 'Cung gân cơ nâng hậu môn', 'Tendinous arch of levator ani', 'fascia', 'fascia', {
  description: 'Cung gân của cơ nâng hậu môn ở thành chậu bên, tạo điểm bám cho sàn chậu và treo các cấu trúc vùng chậu.',
  functions: ['Tạo điểm bám cho cơ nâng hậu môn.', 'Hỗ trợ sàn chậu giữ tạng trong ổ bụng.', 'Tham gia kiểm soát áp lực ổ bụng.'],
  training: 'Tập sàn chậu và thở 360°; tránh nín thở gắng sức kéo dài.',
  clinical: 'Yếu sàn chậu có thể gây rò nước tiểu khi ho/hắt hơi; cần đánh giá chuyên khoa.',
});
addConnective(['FMA72309', 'FMA72311'], 'Dây chằng trâm móng', 'Stylohyoid ligament', 'ligament', 'ligament', {
  region: 'Cổ',
  description: 'Dây chằng trâm móng nối mỏm trâm xương thái dương với xương móng, cùng cơ trâm móng ổn định xương móng khi nuốt.',
  functions: ['Treo và ổn định xương móng.', 'Hỗ trợ nuốt và phát âm.', 'Giữ khoảng cách giữa sọ và xương móng.'],
  training: 'Giữ cổ mềm, thở đều; không kéo giãn cổ mạnh đột ngột.',
  clinical: 'Vôi hóa dây chằng trâm móng có thể gây đau/khó nuốt (hội chứng Eagle); cần khám.',
});
addConnective('FMA55227', 'Dây chằng móng – nắp thanh môn', 'Hyo-epiglottic ligament', 'larynx', 'ligament');
addConnective(['FMA55251', 'FMA55252'], 'Nón đàn hồi', 'Conus elasticus', 'larynx', 'membrane', {
  description: 'Nón đàn hồi là màng sợi đàn hồi dưới thanh môn, nối sụn giáp – sụn nhẫn và tham gia cấu trúc dây thanh.',
  functions: ['Ổn định đường thở dưới thanh môn.', 'Tham gia căng dây thanh khi phát âm.', 'Bảo vệ đường thở khi nuốt.'],
  training: 'Thở bằng mũi và giữ cổ mềm khi gắng sức.',
  clinical: 'Khó thở, khàn tiếng kéo dài cần khám tai mũi họng.',
});
addConnective(['FMA55619', 'FMA55620'], 'Đường ráp chân bướm – hàm', 'Pterygomandibular raphe', 'raphe', 'raphe', {
  region: 'Đầu & cổ',
  description: 'Đường ráp nối cơ căng vòm miệng với cơ khít hầu trên, tạo điểm bám giữa ở thành bên hầu.',
  functions: ['Tạo điểm bám giữa cho cơ vòm miệng – hầu.', 'Ổn định thành bên hầu khi nuốt.', 'Tham gia phối hợp nuốt – phát âm.'],
  training: 'Không có bài tập trực tiếp; giữ tư thế đầu – cổ trung tính.',
  clinical: 'Đau khi nuốt hoặc há miệng hạn chế cần đánh giá vùng hầu/hàm.',
});
addConnective('FMA258850', 'Gân trung gian cơ hai thân', 'Intermediate tendon (digastric)', 'tendon', 'tendon', {
  region: 'Cổ',
  description: 'Gân trung gian của cơ hai thân (digastric) treo vào xương móng qua một vòng sợi, giúp cơ mở hàm dưới.',
  functions: ['Đổi hướng lực của cơ hai thân.', 'Hỗ trợ mở hàm và nâng xương móng.', 'Tham gia nuốt.'],
  training: 'Thả lỏng hàm và cổ; tránh nghiến răng khi gắng sức.',
  clinical: 'Đau dưới hàm khi nuốt/ngáp kéo dài cần khám.',
});
addConnective('FMA55077', 'Đường ráp họng', 'Pharyngeal raphe', 'raphe', 'raphe', {
  region: 'Cổ',
  description: 'Đường ráp dọc sau họng, nơi các cơ khít hầu gặp nhau; tạo điểm bám giữa cho thành hầu.',
  functions: ['Ổn định thành sau họng.', 'Tạo điểm bám cho cơ khít hầu.', 'Phối hợp nuốt.'],
  training: 'Thở đều, giữ cổ mềm; không gắng sức khi đang đau họng.',
  clinical: 'Khó nuốt hoặc đau họng kéo dài cần khám.',
});
addConnective(['FMA55140', 'FMA55141'], 'Dây chằng giáp móng bên', 'Lateral thyrohyoid ligament', 'larynx', 'ligament');
addConnective(['FMA55133', 'FMA55134'], 'Màng giáp móng', 'Thyrohyoid membrane', 'larynx', 'membrane');
addConnective('FMA55230', 'Dây chằng giáp – nắp thanh môn', 'Thyro-epiglottic ligament', 'larynx', 'ligament');
addConnective(['FMA55245', 'FMA55246'], 'Dây chằng thanh âm', 'Vocal ligament', 'larynx', 'ligament', {
  description: 'Dây chằng thanh âm nằm trong nếp thanh âm, căng giữa sụn giáp và sụn phễu; rung động tạo giọng nói.',
  functions: ['Tạo bờ tự do của dây thanh.', 'Rung khi thở ra để phát âm.', 'Phối hợp khép/mở thanh môn khi nuốt và thở.'],
  training: 'Hít thở bằng mũi, không siết cổ; nếu tập nặng, thở ra có kiểm soát thay vì nín thở.',
  clinical: 'Khàn tiếng kéo dài, mất tiếng hoặc khó thở cần khám tai mũi họng.',
});
addConnective('FMA55138', 'Dây chằng giáp móng giữa', 'Median thyrohyoid ligament', 'larynx', 'ligament');
addConnective('FMA55237', 'Dây chằng nhẫn giáp giữa', 'Median cricothyroid ligament', 'larynx', 'ligament', {
  description: 'Dây chằng nhẫn giáp giữa nối sụn giáp với sụn nhẫn ở đường giữa; là mốc quan trọng của đường thở cấp cứu.',
  functions: ['Nối sụn giáp và sụn nhẫn.', 'Ổn định thanh quản khi nuốt và phát âm.', 'Là mốc giải phẫu của mở khí quản cấp cứu.'],
  clinical: 'Chỉ thủ thuật đường thở cấp cứu mới can thiệp vùng này; không ấn/kéo cổ khi không có chỉ định.',
});
addConnective(['FMA49067', 'FMA49068'], 'Ròng rọc cơ chéo trên', 'Trochlea of superior oblique', 'cartilage', 'fibrocartilage', {
  region: 'Mắt',
  description: 'Ròng rọc sụn – sợi ở góc trên trong ổ mắt, đổi hướng gân cơ chéo trên để cơ xoay nhãn cầu.',
  functions: ['Đổi hướng lực gân cơ chéo trên.', 'Hỗ trợ xoay trong và hạ nhãn cầu.', 'Ổn định chuyển động mắt.'],
  training: 'Không có bài tập trực tiếp; giảm mỏi mắt bằng nghỉ nhìn xa khi dùng màn hình lâu.',
  clinical: 'Nhìn đôi hoặc lác sau chấn thương mắt cần khám chuyên khoa mắt.',
});
addConnective('FMA54159', 'Gân cơ nâng mi trên', 'Tendon of levator palpebrae superioris', 'tendon', 'tendon', {
  region: 'Mắt',
  description: 'Gân cơ nâng mi trên bám vào sụn mi và da mi, nâng mí mắt khi mở mắt.',
  functions: ['Nâng mí mắt trên.', 'Giữ độ mở mí khi nhìn.', 'Phối hợp với cơ Müller duy trì mí mở.'],
  clinical: 'Sụp mi đột ngột kèm yếu cơ/nhìn đôi là dấu hiệu cần khám cấp cứu thần kinh.',
});
addConnective(['FMA35192', 'FMA35193'], 'Màng gian cốt cẳng chân', 'Interosseous membrane of leg', 'membrane', 'membrane', {
  region: 'Cẳng chân',
  description: 'Màng gian cốt nối xương chày và xương mác, chia khoang trước – sau cẳng chân và truyền lực giữa hai xương.',
  functions: ['Nối chày – mác và giữ khoảng cách hai xương.', 'Tạo diện bám cho cơ cẳng chân.', 'Truyền lực từ chày sang mác khi đặt chân.'],
  training: 'Giữ cổ chân trung tính khi squat/chạy; tăng tải từ từ để màng và cơ thích ứng.',
  clinical: 'Đau sâu cẳng chân sau chấn thương xoay hoặc chạy nhiều cần đánh giá màng gian cốt và khoang cẳng chân.',
});
addConnective(['FMA49147', 'FMA49148'], 'Dây chằng hãm cơ trực trong', 'Check ligament of medial rectus', 'ligament', 'ligament', { region: 'Mắt' });
addConnective(['FMA49144', 'FMA49145'], 'Dây chằng hãm cơ trực ngoài', 'Check ligament of lateral rectus', 'ligament', 'ligament', { region: 'Mắt' });
addConnective('FMA11336', 'Đường trắng', 'Linea alba', 'fascia', 'fascia', {
  region: 'Bụng',
  description: 'Đường trắng là dải cân dọc giữa thành bụng trước, nơi cân của các cơ bụng gặp nhau từ xương ức đến xương mu.',
  functions: ['Tạo điểm bám giữa cho cơ bụng.', 'Ổn định thành bụng trước.', 'Truyền lực giữa hai bên thân.'],
  training: 'Tập thở 360°, plank và anti-rotation; tránh gập bụng nặng khi còn đau hoặc sau sinh chưa hồi phục.',
  clinical: 'Đau đường trắng hoặc tách cơ thẳng bụng (diastasis) sau sinh cần đánh giá chuyên khoa.',
});
addConnective(['FMA22425', 'FMA22426'], 'Cơ căng cân đùi', 'Tensor fasciae latae', 'fascia', 'muscle-fascia', {
  region: 'Hông',
  description: 'Cơ căng cân đùi là cơ nhỏ ở mặt ngoài hông, đổ vào dải chậu chày; giúp gấp, dạng và xoay trong đùi, đồng thời căng dải chậu chày.',
  functions: ['Gấp và dạng đùi.', 'Xoay trong đùi.', 'Căng dải chậu chày để ổn định hông/gối khi đứng một chân.'],
  training: 'Tập hip abduction, side plank và kiểm soát chậu; tránh lạm dụng khi đau mặt ngoài hông.',
  clinical: 'Đau mặt ngoài hông khi chạy/leo cầu thang có thể liên quan dải chậu chày và cơ căng cân đùi.',
  attachments: ['gluteus-medius', 'gluteus-minimus'],
});
addConnective(['FMA23707', 'FMA23708'], 'Màng gian cốt cẳng tay', 'Interosseous membrane of forearm', 'membrane', 'membrane', {
  region: 'Cẳng tay',
  description: 'Màng gian cốt nối xương quay và xương trụ, chia khoang trước – sau cẳng tay và truyền lực từ quay sang trụ.',
  functions: ['Nối quay – trụ và giữ khoảng cách hai xương.', 'Tạo diện bám cho cơ cẳng tay.', 'Truyền lực từ bàn tay lên cẳng tay.'],
  training: 'Giữ cổ tay trung tính khi đẩy/kéo; kiểm soát sấp/ngửa trong biên độ không đau.',
  clinical: 'Đau sâu cẳng tay sau chấn thương xoay hoặc ngã chống tay cần đánh giá màng gian cốt.',
});
addConnective(['FMA258847', 'FMA264844'], 'Gân gót (Achilles)', 'Calcaneal tendon', 'tendon', 'tendon', {
  region: 'Cẳng chân',
  description: 'Gân gót nối cơ bắp chân và cơ dép với củ gót; là gân lớn nhất cơ thể, chịu lực đẩy mũi chân khi đi/chạy/nhảy.',
  functions: ['Truyền lực duỗi cổ chân từ cơ sinh đôi và cơ dép.', 'Lưu trữ năng lượng đàn hồi khi chạy/nhảy.', 'Ổn định cổ chân khi đặt chân.'],
  training: 'Tăng dần calf raise, tập eccentric (hạ gót chậm) 2–3 lần/tuần; tăng volume chạy từ từ.',
  clinical: 'Đau gân gót khi đẩy mũi chân, cứng buổi sáng hoặc sưng kéo dài cần tiến trình tải và đánh giá chuyên khoa.',
  attachments: ['gastrocnemius', 'soleus'],
});
addConnective(['FMA44249', 'FMA44250'], 'Dây chằng gan chân dài', 'Long plantar ligament', 'ligament', 'ligament', {
  region: 'Bàn chân',
  description: 'Dây chằng gan chân dài chạy từ xương gót tới các xương bàn chân, hỗ trợ vòm dọc và vòm ngang của bàn chân.',
  functions: ['Giữ vòm dọc bàn chân.', 'Ổn định các xương bàn chân khi đặt tải.', 'Hỗ trợ cân gan chân trong hấp thu lực.'],
  training: 'Tập cơ chày sau, cơ mác và short foot; đi chân trần trên mặt phẳng vừa phải.',
  clinical: 'Đau vòm bàn chân khi đứng lâu/đi nhiều có thể liên quan dây chằng và cân gan chân; cần đánh giá nếu kéo dài.',
  attachments: ['tibialis-posterior', 'fibularis-longus', 'flexor-digitorum-longus'],
});

const ORDINALS = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
};

function sideOf(name) {
  if (name.includes('left')) return 'trái';
  if (name.includes('right')) return 'phải';
  return '';
}

function ordinalOf(name) {
  for (const [word, number] of Object.entries(ORDINALS)) {
    if (name.includes(word)) return number;
  }
  return null;
}

function generatedBone(vi, en, group, overrides = {}) {
  const info = groupInfo(group);
  return {
    id: '',
    kind: 'bone',
    vi,
    en,
    group,
    groupVi: info.vi,
    region: overrides.region || info.region,
    type: overrides.type || info.type,
    description: overrides.description || info.description,
    functions: overrides.functions || info.functions,
    training: overrides.training || info.training,
    clinical: overrides.clinical || info.clinical,
    attachments: overrides.attachments || [],
    source: SOURCE_BONE,
    generated: true,
  };
}

function generatedConnective(vi, en, group, type, overrides = {}) {
  const info = groupInfo(group);
  return {
    id: '',
    kind: 'connective',
    vi,
    en,
    group,
    groupVi: info.vi,
    region: overrides.region || info.region,
    type,
    description: overrides.description || info.description,
    functions: overrides.functions || info.functions,
    training: overrides.training || info.training,
    clinical: overrides.clinical || info.clinical,
    attachments: overrides.attachments || [],
    source: SOURCE_CONNECTIVE,
    generated: true,
  };
}

function resolveByName(name, system) {
  const raw = String(name || '').trim();
  const n = raw.toLowerCase();
  if (!n) return null;
  const side = sideOf(n);
  const sideSuffix = side ? ` bên ${side}` : '';

  // Đĩa đệm và sụn sườn là mô liên kết dù nằm trong layer xương của atlas.
  if (n.includes('intervertebral disk')) {
    const number = ordinalOf(n);
    const region = n.includes('cervical')
      ? 'cổ'
      : n.includes('thoracic')
        ? 'ngực'
        : n.includes('lumbar')
          ? 'thắt lưng'
          : '';
    let label = number
      ? `Đĩa đệm ${region} ${region === 'cổ' ? 'C' : region === 'ngực' ? 'T' : 'L'}${number}`
      : 'Đĩa đệm cột sống';
    if (n.includes('of axis')) label = 'Đĩa đệm cổ C2';
    return generatedConnective(label, raw, 'disc', 'fibrocartilage');
  }

  if (n.includes('costal cartilage')) {
    const number = ordinalOf(n);
    return generatedBone(
      number ? `Sụn sườn thứ ${number}${sideSuffix}` : `Sụn sườn${sideSuffix}`,
      raw,
      'thorax',
      { type: 'cartilage' },
    );
  }

  if (n.includes('rib')) {
    const number = ordinalOf(n);
    return generatedBone(
      number ? `Xương sườn thứ ${number}${sideSuffix}` : `Xương sườn${sideSuffix}`,
      raw,
      'thorax',
    );
  }

  if (n.includes('vertebra') && !n.includes('intervertebral')) {
    const number = ordinalOf(n);
    const region = n.includes('cervical') ? 'cổ' : n.includes('thoracic') ? 'ngực' : n.includes('lumbar') ? 'thắt lưng' : '';
    const prefix = region === 'cổ' ? 'C' : region === 'ngực' ? 'T' : region === 'thắt lưng' ? 'L' : '';
    return generatedBone(
      number ? `Đốt sống ${region} ${prefix}${number}` : `Đốt sống ${region}`.trim(),
      raw,
      'spine',
    );
  }

  if (n.includes('metacarpal')) {
    const number = ordinalOf(n);
    return generatedBone(
      number ? `Xương bàn tay thứ ${number}${sideSuffix}` : `Xương bàn tay${sideSuffix}`,
      raw,
      'upper-limb',
    );
  }

  if (n.includes('metatarsal')) {
    const number = ordinalOf(n);
    return generatedBone(
      number ? `Xương bàn chân thứ ${number}${sideSuffix}` : `Xương bàn chân${sideSuffix}`,
      raw,
      'lower-limb',
    );
  }

  if (n.includes('phalanx')) {
    const isToe = n.includes('toe');
    const positionMatch = /^(proximal|middle|distal) phalanx/.exec(n);
    const position = positionMatch
      ? { proximal: 'gần', middle: 'giữa', distal: 'xa' }[positionMatch[1]]
      : 'ngón';
    const after = n.split(' of ')[1] || n;
    let digit = '';
    if (after.includes('thumb')) digit = 'ngón cái';
    else if (after.includes('big toe')) digit = 'ngón chân cái';
    else if (after.includes('little toe')) digit = 'ngón chân út';
    else if (after.includes('little finger')) digit = 'ngón út';
    else if (after.includes('ring finger')) digit = 'ngón áp út';
    else if (after.includes('index finger')) digit = 'ngón trỏ';
    else if (after.includes('middle finger')) digit = 'ngón giữa';
    else if (isToe) {
      const number = ordinalOf(after);
      digit = number ? `ngón chân thứ ${number}` : 'ngón chân';
    }
    if (!digit) digit = 'ngón tay';
    return generatedBone(
      `Đốt ${position} ${digit}${sideSuffix}`,
      raw,
      isToe ? 'lower-limb' : 'upper-limb',
    );
  }

  if (n.includes('sesamoid')) {
    return generatedBone(`Xương vừng${sideSuffix}`, raw, 'sesamoid');
  }

  if (n.includes('tooth')) {
    const jaw = n.includes('upper') ? 'hàm trên' : n.includes('lower') ? 'hàm dưới' : '';
    const t = n.replace(/\bsecondary\b/g, ' ').replace(/\s+/g, ' ');
    const toothType = t.includes('central incisor')
      ? 'răng cửa giữa'
      : t.includes('lateral incisor')
        ? 'răng cửa bên'
        : t.includes('canine')
          ? 'răng nanh'
          : t.includes('first premolar')
            ? 'răng tiền hàm thứ nhất'
            : t.includes('second premolar')
              ? 'răng tiền hàm thứ hai'
              : t.includes('first molar')
                ? 'răng hàm lớn thứ nhất'
                : t.includes('second molar')
                  ? 'răng hàm lớn thứ hai'
                  : 'răng';
    const permanent = n.includes('secondary') ? ' (răng vĩnh viễn)' : '';
    return generatedBone(
      `${toothType.charAt(0).toUpperCase()}${toothType.slice(1)} ${jaw}${sideSuffix}${permanent}`.trim(),
      raw,
      'teeth',
    );
  }

  if (n.includes('gingiva')) {
    const jaw = n.includes('upper') ? 'hàm trên' : n.includes('lower') ? 'hàm dưới' : '';
    return generatedBone(`Lợi ${jaw}`.trim(), raw, 'teeth');
  }

  if (n.includes('cartilage')) {
    return generatedBone(`Sụn${sideSuffix}`, raw, 'cartilage', { type: 'cartilage' });
  }

  if (n.includes('iliotibial tract')) {
    return generatedConnective(`Dải chậu chày${sideSuffix}`, raw, 'fascia', 'fascia', {
      description: 'Dải chậu chày là dải cân dày ở mặt ngoài đùi, nối cơ căng cân đùi và cân mông lớn với xương chày; ổn định hông/gối khi đứng một chân.',
      functions: ['Ổn định mặt ngoài hông và gối.', 'Truyền lực từ cơ mông lớn/căng cân đùi xuống chày.', 'Hỗ trợ kiểm soát chậu khi đi/chạy.'],
      training: 'Tập cơ mông giữa, hip abduction và kiểm soát chậu; tránh lăn ép mạnh khi đang đau cấp.',
      clinical: 'Đau mặt ngoài gối khi chạy/leo cầu thang có thể liên quan dải chậu chày, nhưng cần loại trừ đau khớp/gân.',
      attachments: ['gluteus-maximus', 'gluteus-medius', 'gluteus-minimus', 'quadriceps'],
    });
  }

  if (system === 'connective') {
    return generatedConnective(`Mô liên kết${sideSuffix}`, raw, 'fascia', 'connective');
  }

  return generatedBone(`Cấu trúc xương${sideSuffix}`, raw, 'skeleton');
}

/** Resolve một concept của atlas (FMA id + tên + system) thành metadata đầy đủ. */
export function resolveAtlasStructure({ id, name, system } = {}) {
  if (id && (BONE_ENTRIES[id] || CONNECTIVE_ENTRIES[id])) {
    return { ...(BONE_ENTRIES[id] || CONNECTIVE_ENTRIES[id]), id };
  }
  if (system === 'skeletal' || system === 'connective') {
    const resolved = resolveByName(name, system);
    if (resolved) return { ...resolved, id: id || '', name: name || '' };
  }
  return null;
}

/** Tra cứu trực tiếp theo FMA id (server dùng để không tin client). */
export function getAnatomyStructure(id) {
  if (!id) return null;
  const found = BONE_ENTRIES[id] || CONNECTIVE_ENTRIES[id];
  return found ? { ...found, id } : null;
}

/** Tra cứu theo tên tiếng Anh (dùng cho deep-link/quiz khi chỉ có tên). */
export function findAnatomyByName(name) {
  const normalized = String(name || '').trim().toLowerCase();
  if (!normalized) return null;
  const exact = [...Object.values(BONE_ENTRIES), ...Object.values(CONNECTIVE_ENTRIES)].find(
    (entry) => entry.en.toLowerCase() === normalized || entry.vi.toLowerCase() === normalized,
  );
  if (exact) return exact;
  return resolveByName(name, 'skeletal') || resolveByName(name, 'connective');
}

/** Nghịch đảo attachments: xương/mô liên kết liên quan tới từng cơ. */
export const ANATOMY_FOR_MUSCLE = (() => {
  const map = {};
  for (const entry of [...Object.values(BONE_ENTRIES), ...Object.values(CONNECTIVE_ENTRIES)]) {
    for (const slug of entry.attachments || []) {
      if (!map[slug]) map[slug] = [];
      if (!map[slug].some((item) => item.id === entry.id)) {
        map[slug].push({ id: entry.id, vi: entry.vi, en: entry.en, kind: entry.kind, type: entry.type });
      }
    }
  }
  return map;
})();

export const ANATOMY_GROUPS = GROUP_INFO;
export const BONES = BONE_ENTRIES;
export const CONNECTIVE_TISSUES = CONNECTIVE_ENTRIES;
