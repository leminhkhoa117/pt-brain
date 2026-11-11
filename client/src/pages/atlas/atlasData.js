/**
 * Human Atlas catalogue metadata.
 * Geometry and concept names come from BodyParts3D 4.0 (CC BY 4.0); the
 * Vietnamese labels/explanations here are PT Brain's presentation layer.
 */
export const SYSTEMS = [
  {
    id: 'muscular',
    name: 'Muscles',
    vi: 'Hệ cơ',
    color: '#a85b50',
    description:
      'Các cơ xương tạo chuyển động bằng cách kéo lên điểm bám. Cùng với gân, cơ giữ tư thế, ổn định khớp và sinh nhiệt.',
  },
  {
    id: 'skeletal',
    name: 'Skeleton',
    vi: 'Hệ xương',
    color: '#d8cfb2',
    description:
      'Xương tạo khung nâng đỡ cơ thể, bảo vệ cơ quan và là điểm bám của cơ. Mô xương còn dự trữ khoáng và tạo tế bào máu.',
  },
  {
    id: 'connective',
    name: 'Connective tissue',
    vi: 'Mô liên kết',
    color: '#aec3bb',
    description:
      'Sụn, dây chằng và mô liên kết nâng đỡ, kết nối hoặc phân tách các cấu trúc; ổn định khớp và phân bố lực cơ học.',
  },
  {
    id: 'nervous',
    name: 'Nervous system',
    vi: 'Hệ thần kinh',
    color: '#d8b565',
    description:
      'Não, tủy sống và thần kinh ngoại biên dẫn truyền và xử lý tín hiệu, điều khiển cảm giác, vận động và hoạt động tự chủ.',
  },
  {
    id: 'sensory',
    name: 'Sensory organs',
    vi: 'Cơ quan cảm giác',
    color: '#b0c8ce',
    description:
      'Các cấu trúc phục vụ thị giác, thính giác và thăng bằng; mô chuyên biệt tiếp nhận kích thích và chuyển thành tín hiệu thần kinh.',
  },
  {
    id: 'cardiac',
    name: 'Heart',
    vi: 'Tim',
    color: '#b96760',
    description:
      'Tim là bơm cơ có bốn buồng; van tim dẫn máu một chiều qua tuần hoàn phổi và tuần hoàn hệ thống.',
  },
  {
    id: 'arterial',
    name: 'Arteries',
    vi: 'Động mạch',
    color: '#c05245',
    description: 'Động mạch mang máu từ tim đến mô, hoặc đến phổi trong tuần hoàn phổi.',
  },
  {
    id: 'venous',
    name: 'Veins',
    vi: 'Tĩnh mạch',
    color: '#527c9f',
    description:
      'Tĩnh mạch đưa máu về tim; mạng nông và sâu thu máu từ mô, tĩnh mạch phổi đưa máu giàu oxy từ phổi về.',
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    vi: 'Hô hấp',
    color: '#b98991',
    description:
      'Đường thở dẫn khí tới phổi, nơi trao đổi oxy và CO₂ giữa khí và máu nhờ chênh áp do cơ hô hấp tạo ra.',
  },
  {
    id: 'digestive',
    name: 'Digestive',
    vi: 'Tiêu hóa',
    color: '#b8916b',
    description:
      'Ống tiêu hóa phân giải thức ăn, hấp thu dưỡng chất và nước, rồi đưa chất thải đi tiếp; cơ quan phụ tiết mật và enzyme.',
  },
  {
    id: 'urinary',
    name: 'Urinary',
    vi: 'Tiết niệu',
    color: '#b47961',
    description:
      'Thận lọc máu, điều hòa dịch, điện giải và cân bằng acid–base; nước tiểu theo niệu quản xuống bàng quang rồi ra ngoài.',
  },
  {
    id: 'lymphatic',
    name: 'Lymphatic',
    vi: 'Bạch huyết',
    color: '#879f7c',
    description:
      'Mạch bạch huyết đưa dịch mô dư về tuần hoàn; hạch và cơ quan lympho hỗ trợ giám sát và đáp ứng miễn dịch.',
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    vi: 'Nội tiết',
    color: '#c5a09a',
    description:
      'Cơ quan nội tiết tiết hormone vào máu để điều hòa chuyển hóa, tăng trưởng, đáp ứng stress và sinh sản.',
  },
  {
    id: 'reproductive',
    name: 'Reproductive',
    vi: 'Sinh sản',
    color: '#bda098',
    description:
      'Cấu trúc sinh sản nam trong mô hình góp phần tạo, trưởng thành, vận chuyển tinh trùng và sản xuất hormone sinh dục.',
  },
  {
    id: 'integumentary',
    name: 'Body surface',
    vi: 'Bề mặt cơ thể',
    color: '#ba9b7d',
    description:
      'Bề mặt cơ thể là mốc giải phẫu ngoài; da và mô dưới da tạo hàng rào bảo vệ, cảm giác và điều hòa nhiệt.',
  },
];

export const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map((system) => [system.id, system]));

// The muscle page opens on the functional anatomy layer, not the whole organ set.
export const DEFAULT_VISIBLE = ['muscular', 'skeletal'];

export const PRESETS = {
  all: SYSTEMS.map((system) => system.id),
  muscle: ['muscular', 'skeletal', 'connective'],
  skeleton: ['skeletal', 'connective'],
  organs: [
    'cardiac',
    'respiratory',
    'digestive',
    'urinary',
    'endocrine',
    'reproductive',
    'lymphatic',
  ],
};

export const EXPLANATIONS = {
  heart:
    'Tim là bơm cơ ở lồng ngực. Buồng phải đưa máu lên phổi; buồng trái đưa máu đi nuôi toàn cơ thể.',
  brain:
    'Não là trung tâm của hệ thần kinh; các vùng liên kết hỗ trợ cảm nhận, vận động, ghi nhớ, ngôn ngữ và điều hòa cơ thể.',
  liver:
    'Gan nằm dưới cơ hoành bên phải, xử lý dưỡng chất hấp thu, tạo mật và tổng hợp nhiều protein vận chuyển trong máu.',
  stomach:
    'Dạ dày là khoang cơ giữa thực quản và ruột non; nơi lưu trữ, trộn thức ăn với acid và enzyme trước khi đưa xuống tá tràng.',
  spleen:
    'Lách nằm ở bụng trên bên trái; lọc máu, loại bỏ tế bào máu già và tham gia đáp ứng miễn dịch.',
  pancreas:
    'Tụy vừa tiêu hóa vừa nội tiết: tiết enzyme vào ruột non và hormone như insulin, glucagon vào máu.',
  'urinary bladder': 'Bàng quang là bể chứa cơ ở khung chậu, giữ nước tiểu từ thận qua niệu quản.',
  trachea:
    'Khí quản là đường thở chính nối thanh quản với phế quản; các vòng sụn giữ đường thở mở trong khi thở.',
  diaphragm:
    'Cơ hoành ngăn cách ngực và bụng. Khi co, cơ hoành tăng thể tích lồng ngực và hỗ trợ hút khí vào phổi.',
  lung: 'Phổi là nơi trao đổi khí giữa không khí và máu; phế nang tạo diện tích tiếp xúc rất lớn.',
  kidney:
    'Thận lọc máu, điều hòa nước – điện giải – acid base và tạo nước tiểu; thận cũng tham gia điều hòa huyết áp.',
  femur: 'Xương đùi là xương dài và chắc nhất cơ thể, truyền lực giữa hông và gối.',
  humerus:
    'Xương cánh tay nối khớp vai với khuỷu; là đòn bẩy cho cơ delta, cơ nhị đầu và cơ tam đầu.',
  'cranial nerve':
    'Các dây thần kinh sọ xuất phát từ não và thân não, chi phối giác quan, cơ mặt, cơ nhai và nhiều chức năng tự chủ.',
};

/**
 * Extra context for the detail panel. These are deliberately system-level
 * summaries (not diagnoses); the source geometry is BodyParts3D.
 */
export const SYSTEM_DETAILS = {
  muscular: {
    summary: 'Hệ cơ xương tạo chuyển động, giữ tư thế, ổn định khớp và sinh nhiệt.',
    functions: [
      'Co cơ kéo xương tạo chuyển động có chủ đích.',
      'Giữ tư thế và ổn định khớp khi đứng, đi và nâng tạ.',
      'Duy trì áp lực ổ bụng, hỗ trợ hô hấp và tuần hoàn.',
      'Sinh nhiệt, góp phần điều hòa thân nhiệt.',
    ],
    structures: [
      'Cơ xương',
      'Cơ hoành và cơ liên sườn',
      'Cơ bụng – thân',
      'Cơ chi trên và chi dưới',
    ],
    note: 'Mô hình có 416 mesh cơ. 5 cơ trong metadata PT Brain không có hình học nguồn: latissimus dorsi, multifidus, internal oblique, rectus abdominis, transversus abdominis.',
    related: ['skeletal', 'connective', 'nervous'],
  },
  skeletal: {
    summary: 'Khung xương nâng đỡ cơ thể, bảo vệ cơ quan và làm đòn bẩy cho cơ.',
    functions: [
      'Nâng đỡ trọng lượng và tạo hình dạng cơ thể.',
      'Bảo vệ não, tim, phổi và các cơ quan trong khoang cơ thể.',
      'Là điểm bám và đòn bẩy cho cơ khi vận động.',
      'Dự trữ khoáng và tham gia tạo tế bào máu trong tủy xương.',
    ],
    structures: [
      'Xương sọ – cột sống – lồng ngực',
      'Xương chi trên và chi dưới',
      'Khớp và bề mặt khớp',
      'Sụn khớp',
    ],
    note: 'Mô hình dùng một mẫu nam trưởng thành; không đại diện cho mọi biến thể giải phẫu hoặc khác biệt giới.',
    related: ['muscular', 'connective'],
  },
  connective: {
    summary: 'Mô liên kết nối, nâng đỡ, đệm và phân bố lực giữa các mô.',
    functions: [
      'Kết nối xương với xương, cơ với xương và các lớp mô.',
      'Ổn định khớp và hạn chế chuyển động quá mức.',
      'Truyền lực từ cơ sang xương.',
      'Đệm, bọc và tách các cấu trúc giải phẫu.',
    ],
    structures: ['Dây chằng', 'Gân và cân', 'Sụn', 'Bao khớp và mô liên kết quanh khớp'],
    note: 'Ranh giới giữa mô liên kết, gân và một số cấu trúc khớp có thể khác nhau giữa các cách phân nhóm giải phẫu.',
    related: ['skeletal', 'muscular'],
  },
  nervous: {
    summary: 'Hệ thần kinh thu nhận, xử lý và điều khiển tín hiệu của cơ thể.',
    functions: [
      'Thu nhận cảm giác từ da, cơ, khớp và nội tạng.',
      'Tích hợp thông tin và tạo đáp ứng vận động.',
      'Điều hòa hoạt động tự chủ: tim, hô hấp, tiêu hóa, tiết niệu.',
      'Duy trì nhận thức, trí nhớ và kiểm soát tư thế.',
    ],
    structures: [
      'Não và thân não',
      'Tủy sống',
      'Dây thần kinh sọ',
      'Dây thần kinh ngoại biên và hạch',
    ],
    note: 'Mô hình tập trung vào hình thái giải phẫu; không mô phỏng điện sinh lý hoặc đường dẫn truyền thần kinh.',
    related: ['sensory', 'muscular'],
  },
  sensory: {
    summary: 'Cơ quan cảm giác tiếp nhận thị giác, thính giác và thăng bằng.',
    functions: [
      'Mắt tiếp nhận ánh sáng và tạo tín hiệu thị giác.',
      'Tai tiếp nhận âm thanh và chuyển thành tín hiệu thần kinh.',
      'Bộ máy tiền đình cảm nhận gia tốc và giữ thăng bằng.',
      'Phối hợp với hệ thần kinh để định hướng và phản xạ.',
    ],
    structures: [
      'Mắt và các cơ vận nhãn',
      'Tai ngoài – tai giữa',
      'Tai trong và tiền đình',
      'Dây thần kinh thị giác/thính giác',
    ],
    note: 'Mô hình không bao gồm đầy đủ các cấu trúc mô mềm của mắt và tai.',
    related: ['nervous'],
  },
  cardiac: {
    summary: 'Tim bơm máu qua tuần hoàn phổi và tuần hoàn hệ thống.',
    functions: [
      'Tạo áp lực đẩy máu đi nuôi các mô.',
      'Van tim giữ dòng máu đi một chiều giữa các buồng.',
      'Mạch vành cung cấp máu cho cơ tim.',
      'Phối hợp nhịp nhàng với tuần hoàn phổi và hệ thống.',
    ],
    structures: ['Bốn buồng tim', 'Van tim', 'Cơ tim', 'Động mạch vành'],
    note: 'Mô hình không hiển thị hệ dẫn truyền điện tim (nút xoang, bó His) hoặc chu trình áp lực – thể tích.',
    related: ['arterial', 'venous', 'respiratory'],
  },
  arterial: {
    summary: 'Động mạch phân phối máu từ tim đến các mô.',
    functions: [
      'Mang oxy và dưỡng chất đến mô.',
      'Duy trì áp lực tưới máu cho từng cơ quan.',
      'Động mạch phổi đưa máu đến phổi để trao đổi khí.',
      'Tham gia điều hòa huyết áp và phân bố dòng máu.',
    ],
    structures: [
      'Động mạch chủ và các nhánh lớn',
      'Động mạch vành',
      'Động mạch phổi',
      'Mạng mạch nhỏ trong mô',
    ],
    note: 'Đường đi và màu sắc trong mô hình mang tính minh họa, không phải chụp mạch lâm sàng.',
    related: ['cardiac', 'venous'],
  },
  venous: {
    summary: 'Tĩnh mạch thu máu từ mô và đưa máu trở về tim.',
    functions: [
      'Thu máu đã trao đổi chất từ các mô.',
      'Duy trì lượng máu dự trữ trong tuần hoàn.',
      'Van tĩnh mạch hỗ trợ dòng chảy một chiều ở chi.',
      'Tĩnh mạch phổi đưa máu giàu oxy từ phổi về tim.',
    ],
    structures: ['Tĩnh mạch chủ', 'Tĩnh mạch nông và sâu', 'Tĩnh mạch phổi', 'Van tĩnh mạch'],
    note: 'Mô hình không mô phỏng gradient áp lực hoặc cơ chế bơm cơ – van khi vận động.',
    related: ['cardiac', 'arterial'],
  },
  respiratory: {
    summary: 'Hệ hô hấp trao đổi oxy và CO₂ giữa không khí và máu.',
    functions: [
      'Thông khí: đưa khí vào và ra khỏi phổi.',
      'Trao đổi khí tại phế nang.',
      'Tham gia điều hòa acid–base máu.',
      'Hỗ trợ phát âm và bảo vệ đường thở.',
    ],
    structures: [
      'Đường thở trên',
      'Khí quản và phế quản',
      'Phổi và phế nang',
      'Cơ hoành và lồng ngực',
    ],
    note: 'Mô hình không mô phỏng cơ học thông khí hoặc trao đổi khí theo thời gian.',
    related: ['cardiac', 'muscular'],
  },
  digestive: {
    summary: 'Hệ tiêu hóa phân giải thức ăn, hấp thu dưỡng chất và thải chất bã.',
    functions: [
      'Tiếp nhận và vận chuyển thức ăn.',
      'Tiêu hóa cơ học và enzyme.',
      'Hấp thu nước, điện giải và dưỡng chất.',
      'Tạo hàng rào miễn dịch và thải chất bã.',
    ],
    structures: ['Miệng – thực quản', 'Dạ dày', 'Ruột non – ruột già', 'Gan, túi mật và tụy'],
    note: 'Mô hình không hiển thị đầy đủ vi khuẩn đường ruột, niêm mạc hoặc mạch máu tạng.',
    related: ['endocrine', 'lymphatic'],
  },
  urinary: {
    summary: 'Hệ tiết niệu lọc máu, điều hòa dịch – điện giải và thải nước tiểu.',
    functions: [
      'Lọc máu tại cầu thận.',
      'Điều hòa nước, điện giải và cân bằng acid–base.',
      'Tham gia điều hòa huyết áp và tạo hồng cầu.',
      'Dẫn và thải nước tiểu ra ngoài.',
    ],
    structures: ['Thận', 'Niệu quản', 'Bàng quang', 'Niệu đạo'],
    note: 'Mô hình chỉ có 6 mesh; không hiển thị đơn vị thận – ống thận ở mức vi thể.',
    related: ['cardiac', 'endocrine'],
  },
  lymphatic: {
    summary: 'Hệ bạch huyết đưa dịch mô về tuần hoàn và hỗ trợ miễn dịch.',
    functions: [
      'Thu dịch mô dư và protein về tuần hoàn.',
      'Vận chuyển tế bào miễn dịch và kháng nguyên.',
      'Giám sát và đáp ứng miễn dịch.',
      'Hấp thu mỡ ở ruột qua mạch bạch huyết.',
    ],
    structures: ['Mạch bạch huyết', 'Hạch bạch huyết', 'Lách', 'Tuyến ức và amidan'],
    note: 'Mô hình chỉ có 3 mesh của hệ bạch huyết; đây là hệ được lược bớt nhiều nhất trong nguồn.',
    related: ['venous', 'digestive'],
  },
  endocrine: {
    summary: 'Hệ nội tiết tiết hormone điều hòa chuyển hóa, tăng trưởng và sinh sản.',
    functions: [
      'Điều hòa chuyển hóa và đường huyết.',
      'Điều hòa tăng trưởng và phát triển.',
      'Đáp ứng stress và cân bằng dịch – điện giải.',
      'Điều hòa chức năng sinh sản.',
    ],
    structures: [
      'Tuyến yên',
      'Tuyến giáp – cận giáp',
      'Tuyến thượng thận',
      'Tụy nội tiết và tuyến sinh dục',
    ],
    note: 'Mô hình chỉ có 4 mesh; nhiều tuyến nhỏ và mô nội tiết không được biểu diễn.',
    related: ['nervous', 'reproductive', 'urinary'],
  },
  reproductive: {
    summary: 'Hệ sinh sản nam tạo tinh trùng và hormone sinh dục.',
    functions: [
      'Sản xuất và trưởng thành tinh trùng.',
      'Tiết hormone sinh dục.',
      'Vận chuyển tinh trùng và dịch sinh sản.',
      'Tham gia chức năng sinh sản và tình dục.',
    ],
    structures: [
      'Tinh hoàn',
      'Mào tinh và ống dẫn tinh',
      'Tuyến tiền liệt và túi tinh',
      'Dương vật',
    ],
    note: 'Mô hình chỉ có cấu trúc sinh sản nam trưởng thành; không đại diện cho sinh sản nữ.',
    related: ['endocrine', 'urinary'],
  },
  integumentary: {
    summary: 'Da và mô dưới da tạo hàng rào bảo vệ, cảm giác và điều hòa nhiệt.',
    functions: [
      'Bảo vệ cơ thể khỏi tác nhân cơ học, hóa học và vi sinh.',
      'Điều hòa thân nhiệt qua mồ hôi và mạch máu da.',
      'Thu nhận cảm giác xúc giác, đau và nhiệt.',
      'Tổng hợp vitamin D và tham gia bài tiết nhẹ.',
    ],
    structures: [
      'Biểu bì và trung bì',
      'Mô dưới da',
      'Tuyến mồ hôi – tuyến bã',
      'Nang lông và móng',
    ],
    note: 'Mô hình chỉ có 5 mesh bề mặt với độ trong suốt thấp; không hiển thị chi tiết mô học.',
    related: ['sensory', 'lymphatic'],
  },
};

export function systemFor(id) {
  return SYSTEM_BY_ID[id] ?? null;
}

export function explanation(name, systemId) {
  const key = String(name || '').toLowerCase();
  return (
    EXPLANATIONS[key] ||
    systemFor(systemId)?.description ||
    'Cấu trúc được xác định từ bộ dữ liệu giải phẫu nguồn.'
  );
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}
