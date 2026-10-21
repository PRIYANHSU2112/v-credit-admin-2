/**
 * High-fidelity Enterprise Mock Seed Data
 * Industry-standard naming and data structures reflecting V-Credit console operations
 */

export interface DashboardStats {
  stockistCount: number
  distributorCount: number
  dealerCount: number
  userCount: number
  removeUserCount: number
  today30UserCount: number
  todayRunningUserCount: number
  todayIphoneUserCount: number
  totalKeys: number
  transferedKeys: number
  balanceKeys: number
  totalIphoneKeys: number
  transferIphoneKeys: number
  balanceIphoneKeys: number
}

export const DEFAULT_DASHBOARD_STATS: DashboardStats = {
  stockistCount: 3,
  distributorCount: 2,
  dealerCount: 79,
  userCount: 9419,
  removeUserCount: 2817,
  today30UserCount: 5,
  todayRunningUserCount: 0,
  todayIphoneUserCount: 1,
  totalKeys: 13022,
  transferedKeys: 12982,
  balanceKeys: 40,
  totalIphoneKeys: 500,
  transferIphoneKeys: 200,
  balanceIphoneKeys: 300,
}

export interface DistributorRecord {
  id: string
  _id?: string
  entityCode?: string
  agency: string
  name?: string
  phone: string
  email?: string
  stockist?: string
  superStockiest?: string
  city: string
  state: string
  territory?: string
  lastBillingDate: string
  remark?: string
  availableKeys: number
  available?: number
  usedKeys: number
  totalKeys: number
  keys?: number
  iphoneKeys: number
  enterpriseRole?: 'distributor'
  status?: string
}

export const MOCK_DISTRIBUTORS: DistributorRecord[] = [
  {
    id: 'dist_1',
    _id: '6708ab9e1234567890abc001',
    entityCode: 'DST-1001',
    agency: 'Music Beats',
    name: 'Music Beats',
    phone: '9407262622',
    email: 'musicbeats@vcredit.in',
    stockist: 'Music Beats',
    superStockiest: 'Music Beats',
    city: 'Betul',
    state: 'Madhya Pradesh',
    territory: 'Madhya Pradesh',
    lastBillingDate: '25-07-2026 16:45:48',
    remark: 'baad me lenge',
    availableKeys: 0,
    available: 0,
    usedKeys: 5810,
    totalKeys: 5810,
    keys: 5810,
    iphoneKeys: 0,
    enterpriseRole: 'distributor',
    status: 'Active',
  },
  {
    id: 'dist_2',
    _id: '6708ab9e1234567890abc002',
    entityCode: 'DST-1002',
    agency: 'VEDA ENTERPRISE',
    name: 'VEDA ENTERPRISE',
    phone: '7000142357',
    email: 'veda.enterprise@vcredit.in',
    stockist: 'Music Beats',
    superStockiest: 'Music Beats',
    city: 'Betul',
    state: 'Madhya Pradesh',
    territory: 'Madhya Pradesh',
    lastBillingDate: '20-07-2026 19:05:57',
    remark: 'Active network',
    availableKeys: 0,
    available: 0,
    usedKeys: 3200,
    totalKeys: 3200,
    keys: 3200,
    iphoneKeys: 20,
    enterpriseRole: 'distributor',
    status: 'Active',
  },
  {
    id: 'dist_3',
    _id: '6708ab9e1234567890abc003',
    entityCode: 'DST-1003',
    agency: 'Apex Telecom Logistics',
    name: 'Apex Telecom Logistics',
    phone: '9811029384',
    email: 'apextelecom@vcredit.in',
    stockist: 'North Region Key Logistics',
    superStockiest: 'North Region Key Logistics',
    city: 'Ludhiana',
    state: 'Punjab',
    territory: 'Punjab',
    lastBillingDate: '28-09-2026 14:12:00',
    remark: 'Bulk stock approved',
    availableKeys: 40,
    available: 40,
    usedKeys: 5160,
    totalKeys: 5200,
    keys: 5200,
    iphoneKeys: 50,
    enterpriseRole: 'distributor',
    status: 'Active',
  },
  {
    id: 'dist_4',
    _id: '6708ab9e1234567890abc004',
    entityCode: 'DST-1004',
    agency: 'Delhi Hub Key Distribution',
    name: 'Delhi Hub Key Distribution',
    phone: '9899120934',
    email: 'delhidist@vcredit.in',
    stockist: 'North Region Key Logistics',
    superStockiest: 'North Region Key Logistics',
    city: 'New Delhi',
    state: 'Delhi',
    territory: 'Delhi NCR',
    lastBillingDate: '30-09-2026 18:30:20',
    remark: 'Fast turnover',
    availableKeys: 120,
    available: 120,
    usedKeys: 7680,
    totalKeys: 7800,
    keys: 7800,
    iphoneKeys: 80,
    enterpriseRole: 'distributor',
    status: 'Active',
  },
]

export interface FollowupRemark {
  id: string
  remarkNo: number
  remark: string
  createdDate: string
}

export interface DealerRecord {
  id: string
  _id?: string
  entityCode?: string
  dealerShop: string
  name?: string
  dealerName?: string
  phone: string
  email?: string
  lockScreenNumber?: string
  password?: string
  dealerCode?: string
  createDate?: string
  lastActivation: string
  distributor: string
  superStockiest?: string
  national?: string
  gstNumber?: string
  gst?: string
  address?: string
  city: string
  district?: string
  state: string
  territory?: string
  pincode?: string
  lastBillingDate: string
  availableKeys: number
  available?: number
  totalKeys: number
  keys?: number
  remark?: string
  lockAccess: boolean
  enterpriseRole?: 'dealer'
  status?: string
  document1?: string
  document2?: string
  followups?: FollowupRemark[]
}

export const MOCK_DEALERS: DealerRecord[] = [
  {
    id: 'dlr_1',
    _id: '6708ab9e1234567890def001',
    entityCode: 'DLR-1001',
    dealerShop: 'Malviya mobile hub',
    name: 'Malviya mobile hub',
    dealerName: 'Abhishek malviya',
    phone: '7974689544',
    email: 'abhimalviya319@gmail.com',
    lockScreenNumber: '9183689544',
    password: 'Emi@123',
    dealerCode: '79746',
    createDate: '08/10/2026 16:44:10',
    lastActivation: 'NA',
    distributor: 'VEDA ENTERPRISE',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '23AABCU9603R1ZM',
    gst: '23AABCU9603R1ZM',
    address: 'Bus stand Sukhtawa kalaakhar road sukhtawa',
    city: 'Betul',
    district: 'sukhtawa',
    state: 'Madhya Pradesh',
    territory: 'Madhya Pradesh',
    pincode: '460001',
    lastBillingDate: 'NA',
    availableKeys: 0,
    available: 0,
    totalKeys: 0,
    keys: 0,
    remark: 'baad r',
    lockAccess: false,
    enterpriseRole: 'dealer',
    status: 'Active',
    document1: 'Aadhar_Card.pdf',
    document2: 'Shop_License.pdf',
    followups: [
      { id: 'f1', remarkNo: 1, remark: 'Requested quota of 20 keys for festive promo', createdDate: '12-10-2026 11:20:00' },
      { id: 'f2', remarkNo: 2, remark: 'GST & KYC documents reviewed', createdDate: '10-10-2026 14:15:30' },
      { id: 'f3', remarkNo: 3, remark: 'Shop onboarded by field representative', createdDate: '08-10-2026 16:50:00' },
    ],
  },
  {
    id: 'dlr_2',
    _id: '6708ab9e1234567890def002',
    entityCode: 'DLR-1002',
    dealerShop: 'SHREE GURUSHAHEB MOBILE',
    name: 'SHREE GURUSHAHEB MOBILE',
    dealerName: 'Gurupreet Singh',
    phone: '9479597706',
    email: 'gurushaheb@gmail.com',
    lockScreenNumber: '9479597706',
    password: 'Emi@123',
    dealerCode: '94795',
    createDate: '10/09/2026 11:15:00',
    lastActivation: '30/09/2026 17:55:07',
    distributor: 'VEDA ENTERPRISE',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '23AABCU9603R1ZN',
    gst: '23AABCU9603R1ZN',
    address: 'Main Bazaar Road, Near Bus Stand',
    city: 'Betul',
    district: 'Betul',
    state: 'Madhya Pradesh',
    territory: 'Madhya Pradesh',
    pincode: '460001',
    lastBillingDate: '15-08-2026',
    availableKeys: 2,
    available: 2,
    totalKeys: 140,
    keys: 140,
    remark: 'High performance store',
    lockAccess: true,
    enterpriseRole: 'dealer',
    status: 'Active',
    document1: 'Shop_Reg.pdf',
    document2: 'Owner_ID.pdf',
    followups: [
      { id: 'f4', remarkNo: 1, remark: 'Active sales running smoothly', createdDate: '28-09-2026 10:00:00' },
    ],
  },
  {
    id: 'dlr_3',
    dealerShop: 'PURNA MOBILE',
    dealerName: 'Rajesh Purna',
    phone: '9617007248',
    email: 'purnamobile@gmail.com',
    lockScreenNumber: '9617007248',
    password: 'Emi@123',
    dealerCode: '96170',
    createDate: '31/08/2026 13:57:21',
    lastActivation: '30/09/2026 16:07:23',
    distributor: 'Music Beats',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '',
    address: 'Cinema Square, Multai',
    city: 'Multai',
    district: 'Betul',
    state: 'Madhya Pradesh',
    pincode: '460661',
    lastBillingDate: '22-08-2026',
    availableKeys: 9,
    totalKeys: 138,
    remark: 'Prompt collections',
    lockAccess: true,
    document1: 'Purna_KYC.pdf',
    followups: [
      { id: 'f5', remarkNo: 1, remark: 'Disbursed 10 phones on loan', createdDate: '25-09-2026 16:30:00' },
    ],
  },
  {
    id: 'dlr_4',
    dealerShop: 'MOBILE SHOPI',
    dealerName: 'Manoj Patel',
    phone: '7509176100',
    email: 'mobileshopibtl@gmail.com',
    lockScreenNumber: '7509176100',
    password: 'Emi@123',
    dealerCode: '75091',
    createDate: '15/07/2026 10:30:00',
    lastActivation: '22-09-2026 21:30:59',
    distributor: 'VEDA ENTERPRISE',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '23BAMPM8820Q1ZO',
    address: 'Station Road, Betul',
    city: 'Betul',
    district: 'Betul',
    state: 'Madhya Pradesh',
    pincode: '460001',
    lastBillingDate: '01-09-2026',
    availableKeys: 0,
    totalKeys: 10,
    remark: 'Requested key top-up',
    lockAccess: true,
    followups: [],
  },
  {
    id: 'dlr_5',
    dealerShop: 'OM SAI MOBILE',
    dealerName: 'Sanjay Deshmukh',
    phone: '8827617208',
    email: 'omsaibetul@gmail.com',
    lockScreenNumber: '8827617208',
    password: 'Emi@123',
    dealerCode: '88276',
    createDate: '07/09/2026 20:43:21',
    lastActivation: '10/09/2026 15:45:43',
    distributor: 'VEDA ENTERPRISE',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '',
    address: 'Ganj Market, Betul',
    city: 'Betul',
    district: 'Betul',
    state: 'Madhya Pradesh',
    pincode: '460001',
    lastBillingDate: '07-09-2026',
    availableKeys: 46,
    totalKeys: 50,
    remark: 'Consistent dealer',
    lockAccess: true,
    followups: [],
  },
  {
    id: 'dlr_6',
    dealerShop: 'IRFAN MOBILE CARE CENTER',
    dealerName: 'Irfan Khan',
    phone: '9981914786',
    email: 'irfanmobile@gmail.com',
    lockScreenNumber: '9981914786',
    password: 'Emi@123',
    dealerCode: '99819',
    createDate: '03/09/2026 17:51:19',
    lastActivation: '03/09/2026 22:20:18',
    distributor: 'VEDA ENTERPRISE',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '',
    address: 'Near Old Bus Stand',
    city: 'Betul',
    district: 'Betul',
    state: 'Madhya Pradesh',
    pincode: '460001',
    lastBillingDate: '03-09-2026',
    availableKeys: 19,
    totalKeys: 20,
    remark: 'Requesting iPhone keys',
    lockAccess: true,
    followups: [],
  },
  {
    id: 'dlr_7',
    dealerShop: 'PHONE WALE',
    dealerName: 'Vikas Jain',
    phone: '9893050770',
    email: 'phonewale@gmail.com',
    lockScreenNumber: '9893050770',
    password: 'Emi@123',
    dealerCode: '98930',
    createDate: '20/07/2026 19:07:02',
    lastActivation: '14/10/2026 15:28:29',
    distributor: 'VEDA ENTERPRISE',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '23AABCP9012K1Z3',
    address: 'Kothi Bazaar, Betul',
    city: 'Betul',
    district: 'Betul',
    state: 'Madhya Pradesh',
    pincode: '460001',
    lastBillingDate: '15-09-2026',
    availableKeys: 32,
    totalKeys: 68,
    remark: 'High volume store',
    lockAccess: true,
    followups: [],
  },
  {
    id: 'dlr_8',
    dealerShop: 'M&B FAINCE',
    dealerName: 'Babulal Yadav',
    phone: '7000142357',
    email: 'mbfaince@gmail.com',
    lockScreenNumber: '7000142357',
    password: 'Emi@123',
    dealerCode: '70001',
    createDate: '03/09/2026 18:08:44',
    lastActivation: '14/10/2026 13:50:41',
    distributor: 'VEDA ENTERPRISE',
    superStockiest: 'Music Beats',
    national: 'HBT EMPLOYEE FAIYAZ',
    gstNumber: '',
    address: 'Itarsi Road, Betul',
    city: 'Betul',
    district: 'Betul',
    state: 'Madhya Pradesh',
    pincode: '460001',
    lastBillingDate: '03-09-2026',
    availableKeys: 1,
    totalKeys: 203,
    remark: 'Low balance remaining',
    lockAccess: true,
    followups: [],
  },
]

export interface EmiSafeUserRecord {
  id: string
  _id?: string
  customerId?: string
  userName: string
  customerName?: string
  userPhone: string
  customerMobileNumber?: string
  email?: string
  loanId?: string
  activationDate: string
  enrollmentDate?: string
  removedOn?: string
  activatedBy?: string
  dealer: string
  dealerPhone: string
  lockStatus: 'locked' | 'unlocked'
  deviceUnlockStatus?: 'LOCKED' | 'UNLOCKED'
  userFeature: string
  mobileBrand?: string
  mobileModel?: string
  status: 'active' | 'pending' | 'removed'
  loanStatus?: 'APPROVED' | 'PENDING' | 'CLOSED'
  isBanned?: boolean
  unlockCode?: string
  keyCode?: string
  imei1?: string
  imeiNumber1?: string
  imei2?: string
  imeiNumber2?: string
  deviceAgent?: string
  gsfId?: string
  deviceId?: string
  deviceName?: string
  claimed?: string
  devicePolicy?: {
    isResetAllowed: boolean
    isUninstallAllowed: boolean
    isDeveloperOptionsBlocked: boolean
    isWallpaperEnabled: boolean
    wallpaperUrl?: string
    isWhatsAppBlocked: boolean
    isInstagramBlocked: boolean
    isSnapchatBlocked: boolean
    isYouTubeBlocked: boolean
    isFacebookBlocked: boolean
    isDialerBlocked: boolean
    isMessagesBlocked: boolean
    isPlayStoreBlocked: boolean
    isChromeBlocked: boolean
    isVoiceReminderEnabled: boolean
    isLocationEnabled: boolean
  }
}

export const MOCK_USERS: EmiSafeUserRecord[] = [
  {
    id: 'usr_1',
    _id: '6708ab9e1234567890usr001',
    customerId: '6708ab9e1234567890cus001',
    userName: 'Sura uikey Topidhana',
    customerName: 'Sura uikey Topidhana',
    userPhone: '6231386767',
    customerMobileNumber: '6231386767',
    email: 'sura@gmail.com',
    loanId: 'old infinix',
    activationDate: '14/10/2026 19:17:33',
    enrollmentDate: '14/10/2026 19:44:40',
    dealer: 'SIDHEEVINAYAK MOBILE & ELECTRONICS',
    dealerPhone: '6265979852',
    lockStatus: 'unlocked',
    deviceUnlockStatus: 'UNLOCKED',
    userFeature: 'Infinix X6512 Android 11',
    mobileBrand: 'INFINIX',
    mobileModel: 'Infinix X6512',
    status: 'active',
    loanStatus: 'APPROVED',
    isBanned: false,
    unlockCode: '578985',
    keyCode: 'VC-883920',
    imei1: '352839711277967',
    imeiNumber1: '352839711277967',
    imei2: '352839711277975',
    imeiNumber2: '352839711277975',
    deviceAgent: 'Device - INFINIX MOBILITY LIMITED Infinix X6512, Android Version - 11, SDK - 30',
    gsfId: '4029182390',
    deviceId: '0',
    deviceName: 'Infinix Hot 11',
    claimed: 'C',
    activatedBy: '3.0',
    removedOn: '--',
    devicePolicy: {
      isResetAllowed: false,
      isUninstallAllowed: false,
      isDeveloperOptionsBlocked: true,
      isWallpaperEnabled: true,
      wallpaperUrl: 'https://api.vlocker.in/uploads/wallpaper.jpg',
      isWhatsAppBlocked: false,
      isInstagramBlocked: true,
      isSnapchatBlocked: true,
      isYouTubeBlocked: true,
      isFacebookBlocked: true,
      isDialerBlocked: false,
      isMessagesBlocked: false,
      isPlayStoreBlocked: true,
      isChromeBlocked: true,
      isVoiceReminderEnabled: true,
      isLocationEnabled: true,
    },
  },
  {
    id: 'usr_2',
    userName: 'Sumrati akhand',
    userPhone: '9098475697',
    email: 'sumrati.akhand@gmail.com',
    loanId: 'LN-7740',
    activationDate: '14/10/2026 16:43:03',
    enrollmentDate: '14/10/2026 16:55:12',
    dealer: 'SHREE GURUSHAHEB MOBILE',
    dealerPhone: '9479597706',
    lockStatus: 'unlocked',
    userFeature: 'Samsung Galaxy A15',
    status: 'active',
    unlockCode: '492810',
    keyCode: 'VC-772911',
    imei1: '861029384756192',
    imei2: '861029384756193',
    deviceAgent: 'Device - SAMSUNG Galaxy A15, Android Version - 14, SDK - 34',
    gsfId: '3928172635',
    deviceId: '0',
    deviceName: 'Galaxy A15',
    claimed: 'C',
    activatedBy: '3.0',
    removedOn: '--',
  },
  {
    id: 'usr_3',
    userName: 'Anujka Ughde',
    userPhone: '8878142869',
    email: 'anujka.ughde@gmail.com',
    loanId: 'LN-8819',
    activationDate: '14/10/2026 15:28:29',
    enrollmentDate: '14/10/2026 15:40:02',
    dealer: 'PHONE WALE',
    dealerPhone: '9893050770',
    lockStatus: 'unlocked',
    userFeature: 'Redmi Note 13',
    status: 'active',
    unlockCode: '719284',
    keyCode: 'VC-442819',
    imei1: '869281029384756',
    imei2: '869281029384757',
    deviceAgent: 'Device - XIAOMI Redmi Note 13, Android Version - 13, SDK - 33',
    gsfId: '5819203948',
    deviceId: '0',
    deviceName: 'Redmi Note 13',
    claimed: 'C',
    activatedBy: '3.0',
    removedOn: '--',
  },
  {
    id: 'usr_4',
    userName: 'gendlal evane',
    userPhone: '7987108432',
    email: 'gendlal@gmail.com',
    loanId: 'LN-6621',
    activationDate: '14/10/2026 13:50:41',
    enrollmentDate: '14/10/2026 14:05:18',
    dealer: 'M&B FAINCE',
    dealerPhone: '7000142357',
    lockStatus: 'unlocked',
    userFeature: 'Vivo Y28 5G',
    status: 'active',
    unlockCode: '638192',
    keyCode: 'VC-991823',
    imei1: '865432109876543',
    imei2: '865432109876544',
    deviceAgent: 'Device - VIVO Y28 5G, Android Version - 14, SDK - 34',
    gsfId: '6920192837',
    deviceId: '0',
    deviceName: 'Vivo Y28',
    claimed: 'C',
    activatedBy: '3.0',
    removedOn: '--',
  },
  {
    id: 'usr_5',
    userName: 'Shruti verma',
    userPhone: '9691722467',
    email: 'shruti.verma@gmail.com',
    loanId: 'LN-5519',
    activationDate: '14/10/2026 11:46:42',
    enrollmentDate: '14/10/2026 12:00:29',
    dealer: 'PHONE WALE',
    dealerPhone: '9893050770',
    lockStatus: 'unlocked',
    userFeature: 'Realme 12 Pro',
    status: 'active',
    unlockCode: '829104',
    keyCode: 'VC-332910',
    imei1: '864738291029384',
    imei2: '864738291029385',
    deviceAgent: 'Device - REALME 12 Pro 5G, Android Version - 14, SDK - 34',
    gsfId: '8291039485',
    deviceId: '0',
    deviceName: 'Realme 12 Pro',
    claimed: 'C',
    activatedBy: '3.0',
    removedOn: '--',
  },
  {
    id: 'usr_6',
    userName: 'Shivcharn dhurve',
    userPhone: '9243321521',
    email: 'shivcharn@gmail.com',
    loanId: 'LN-4412',
    activationDate: '14/10/2026 10:29:24',
    enrollmentDate: '14/10/2026 10:45:10',
    dealer: 'M&B FAINCE',
    dealerPhone: '7000142357',
    lockStatus: 'unlocked',
    userFeature: 'Oppo A79 5G',
    status: 'active',
    unlockCode: '192847',
    keyCode: 'VC-221948',
    imei1: '863920192837465',
    imei2: '863920192837466',
    deviceAgent: 'Device - OPPO A79 5G, Android Version - 13, SDK - 33',
    gsfId: '9182736450',
    deviceId: '0',
    deviceName: 'Oppo A79',
    claimed: 'C',
    activatedBy: '3.0',
    removedOn: '--',
  },
  {
    id: 'usr_7',
    userName: 'mayank kunde',
    userPhone: '8719872990',
    email: 'mayank.kunde@gmail.com',
    loanId: 'LN-3310',
    activationDate: '13/10/2026 18:58:58',
    enrollmentDate: '13/10/2026 19:10:04',
    dealer: 'SALUJA MOBILE',
    dealerPhone: '7000090006',
    lockStatus: 'unlocked',
    userFeature: 'Samsung Galaxy M34',
    status: 'active',
    unlockCode: '592018',
    keyCode: 'VC-119284',
    imei1: '862819203948576',
    imei2: '862819203948577',
    deviceAgent: 'Device - SAMSUNG Galaxy M34 5G, Android Version - 14, SDK - 34',
    gsfId: '4728193049',
    deviceId: '0',
    deviceName: 'Galaxy M34',
    claimed: 'C',
    activatedBy: '3.0',
    removedOn: '--',
  },
  // Pending Users from Screenshot 000555
  {
    id: 'usr_p1',
    userName: 'sandip vrkde',
    userPhone: '9329390127',
    loanId: 'LN-9041',
    activationDate: '30/09/2026 17:55:07',
    dealer: 'SHREE GURUSHAHEB MOBILE',
    dealerPhone: '9479597706',
    lockStatus: 'unlocked',
    userFeature: 'Samsung Galaxy A15',
    status: 'pending',
    unlockCode: '492819',
    imei1: '862910293847561',
    deviceAgent: 'Samsung Galaxy A15 Android 14',
  },
  {
    id: 'usr_p2',
    userName: 'usha dhikare',
    userPhone: '9421903039',
    loanId: 'LN-8812',
    activationDate: '30/09/2026 16:07:23',
    dealer: 'PURNA MOBILE',
    dealerPhone: '9617007248',
    lockStatus: 'locked',
    userFeature: 'Redmi Note 13',
    status: 'pending',
    unlockCode: '829103',
    imei1: '869281029384752',
    deviceAgent: 'Redmi Note 13 Android 13',
  },
  {
    id: 'usr_p3',
    userName: 'sanju baksare',
    userPhone: '7805038871',
    loanId: 'LN-7729',
    activationDate: '25/09/2026 14:38:05',
    dealer: 'PURNA MOBILE',
    dealerPhone: '9617007248',
    lockStatus: 'unlocked',
    userFeature: 'Vivo Y28 5G',
    status: 'pending',
    unlockCode: '392810',
    imei1: '865432109876541',
  },
  {
    id: 'usr_p4',
    userName: 'ayush kavde',
    userPhone: '9301042362',
    loanId: 'LN-6640',
    activationDate: '16/09/2026 14:01:47',
    dealer: 'SAI MOBILE SHOO CHUNAHAJURI',
    dealerPhone: '9752385925',
    lockStatus: 'unlocked',
    userFeature: 'Realme 12',
    status: 'pending',
    unlockCode: '849201',
    imei1: '864738291029381',
  },
  {
    id: 'usr_p5',
    userName: 'mukesh tandelakar',
    userPhone: '8815965938',
    loanId: 'LN-5520',
    activationDate: '10/09/2026 15:33:59',
    dealer: 'Sagar rathour',
    dealerPhone: '9826916111',
    lockStatus: 'unlocked',
    userFeature: 'Oppo A79',
    status: 'pending',
    unlockCode: '294810',
    imei1: '863920192837461',
  },
  {
    id: 'usr_p6',
    userName: 'indra sariyam',
    userPhone: '9174914789',
    loanId: 'LN-4419',
    activationDate: '09/09/2026 13:40:34',
    dealer: 'OM SAI MOBILE',
    dealerPhone: '8827617208',
    lockStatus: 'unlocked',
    userFeature: 'Samsung M14',
    status: 'pending',
    unlockCode: '619284',
    imei1: '862819203948571',
  },
  {
    id: 'usr_p7',
    userName: 'vikash kakode',
    userPhone: '9404568194',
    loanId: 'LN-3309',
    activationDate: '31/08/2026 14:11:06',
    dealer: 'PURNA MOBILE',
    dealerPhone: '9617007248',
    lockStatus: 'unlocked',
    userFeature: 'Vivo Y18',
    status: 'pending',
    unlockCode: '928104',
    imei1: '861920394857681',
  },
  {
    id: 'usr_p8',
    userName: 'abhishek rathore chicholi',
    userPhone: '7869122016',
    loanId: 'LN-2290',
    activationDate: '22/08/2026 15:17:46',
    dealer: 'Devendra aray',
    dealerPhone: '9926560568',
    lockStatus: 'unlocked',
    userFeature: 'Redmi 13C',
    status: 'pending',
    unlockCode: '492019',
    imei1: '869281029384750',
  },
  {
    id: 'usr_p9',
    userName: 'ankush evney',
    userPhone: '9244611435',
    loanId: 'LN-1180',
    activationDate: '21/08/2026 18:15:22',
    dealer: 'SIDHEEVINAYAK MOBILE & ELECTRONICS',
    dealerPhone: '6265979852',
    lockStatus: 'unlocked',
    userFeature: 'Realme C53',
    status: 'pending',
    unlockCode: '581920',
    imei1: '864738291029380',
  },
  {
    id: 'usr_p10',
    userName: 'Ayush warkde alampur',
    userPhone: '7415414862',
    loanId: 'LN-9920',
    activationDate: '15/08/2026 13:01:25',
    dealer: 'Devendra aray',
    dealerPhone: '9926560568',
    lockStatus: 'unlocked',
    userFeature: 'Samsung A05',
    status: 'pending',
    unlockCode: '729104',
    imei1: '863920192837460',
  },
]

export interface TransferReportItem {
  id: string
  transactionDate: string
  transferTo: string
  sendBy?: string
  noOfKeys: number
  remark?: string
  keyPrice: number
}

export const MOCK_TRANSFER_REPORTS: TransferReportItem[] = [
  {
    id: 'tr_1',
    transactionDate: '25-07-2026 16:45:48',
    transferTo: 'Music Beats',
    noOfKeys: 10,
    remark: '',
    keyPrice: 350,
  },
  {
    id: 'tr_2',
    transactionDate: '25-07-2026 16:06:46',
    transferTo: 'Music Beats',
    noOfKeys: 50,
    remark: '',
    keyPrice: 350,
  },
  {
    id: 'tr_3',
    transactionDate: '20-07-2026 19:05:57',
    transferTo: 'VEDA ENTERPRISE',
    noOfKeys: 200,
    remark: '',
    keyPrice: 350,
  },
  {
    id: 'tr_4',
    transactionDate: '17-07-2026 16:04:21',
    transferTo: 'Music Beats',
    noOfKeys: 100,
    remark: '----',
    keyPrice: 350,
  },
  {
    id: 'tr_5',
    transactionDate: '06-07-2026 16:18:38',
    transferTo: 'VEDA ENTERPRISE',
    noOfKeys: 100,
    remark: '',
    keyPrice: 350,
  },
  {
    id: 'tr_6',
    transactionDate: '03-07-2026 13:56:38',
    transferTo: 'VEDA ENTERPRISE',
    noOfKeys: 2,
    remark: '',
    keyPrice: 350,
  },
]

export const MOCK_DISTRIBUTOR_TO_DEALER_TRANSFERS: TransferReportItem[] = [
  {
    id: 'dtd_1',
    transactionDate: '14-10-2026 15:28:29',
    sendBy: 'VEDA ENTERPRISE',
    transferTo: 'PHONE WALE',
    noOfKeys: 25,
    remark: 'Batch allotment',
    keyPrice: 420,
  },
  {
    id: 'dtd_2',
    transactionDate: '12-10-2026 11:20:00',
    sendBy: 'Music Beats',
    transferTo: 'PURNA MOBILE',
    noOfKeys: 30,
    remark: 'Festival quota',
    keyPrice: 420,
  },
  {
    id: 'dtd_3',
    transactionDate: '08-10-2026 16:44:10',
    sendBy: 'VEDA ENTERPRISE',
    transferTo: 'Malviya mobile hub',
    noOfKeys: 15,
    remark: 'New dealer startup',
    keyPrice: 420,
  },
  {
    id: 'dtd_4',
    transactionDate: '30-09-2026 17:55:07',
    sendBy: 'VEDA ENTERPRISE',
    transferTo: 'SHREE GURUSHAHEB MOBILE',
    noOfKeys: 50,
    remark: '',
    keyPrice: 420,
  },
]

export interface ReceivedReportItem {
  id: string
  transactionDate: string
  receivedFrom: string
  noOfKeys: number
  keyPrice: number
}

export const MOCK_RECEIVED_REPORTS: ReceivedReportItem[] = [
  {
    id: 'rc_1',
    transactionDate: '06-07-2026 16:17:16',
    receivedFrom: 'HBT EMPLOYEE FAIYAZ',
    noOfKeys: 500,
    keyPrice: 70,
  },
  {
    id: 'rc_2',
    transactionDate: '19-12-2025 11:13:47',
    receivedFrom: 'HBT EMPLOYEE FAIYAZ',
    noOfKeys: 400,
    keyPrice: 0,
  },
  {
    id: 'rc_3',
    transactionDate: '27-11-2025 18:24:38',
    receivedFrom: 'HBT EMPLOYEE FAIYAZ',
    noOfKeys: 50,
    keyPrice: 0,
  },
  {
    id: 'rc_4',
    transactionDate: '15-09-2025 17:34:51',
    receivedFrom: 'HBT EMPLOYEE FAIYAZ',
    noOfKeys: 2000,
    keyPrice: 70,
  },
  {
    id: 'rc_5',
    transactionDate: '03-06-2025 15:40:04',
    receivedFrom: 'HBT EMPLOYEE FAIYAZ',
    noOfKeys: 1000,
    keyPrice: 75,
  },
]

export const MOCK_IPHONE_TRANSFER_REPORTS: TransferReportItem[] = [
  {
    id: 'iptr_1',
    transactionDate: '22-09-2026 21:30:59',
    sendBy: 'VEDA ENTERPRISE',
    transferTo: 'MOBILE SHOPI',
    noOfKeys: 10,
    keyPrice: 600,
  },
  {
    id: 'iptr_2',
    transactionDate: '22-09-2026 21:32:12',
    sendBy: 'VEDA ENTERPRISE',
    transferTo: 'MOBILE SHOPI',
    noOfKeys: 10,
    keyPrice: 600,
  },
  {
    id: 'iptr_3',
    transactionDate: '03-09-2026 18:12:03',
    sendBy: 'VEDA ENTERPRISE',
    transferTo: 'IRFAN MOBILE CARE CENTER',
    noOfKeys: 97,
    keyPrice: 600,
  },
  {
    id: 'iptr_4',
    transactionDate: '03-09-2026 18:13:33',
    sendBy: 'VEDA ENTERPRISE',
    transferTo: 'IRFAN MOBILE CARE CENTER',
    noOfKeys: 3,
    keyPrice: 600,
  },
]

// Daily data for Super Analytics bar charts
export const MOCK_ANALYTICS_USERS_DATA = Array.from({ length: 31 }, (_, i) => {
  const day = (i + 1).toString().padStart(2, '0')
  let val = 0
  if (day === '01') val = 5.0
  if (day === '03') val = 3.0
  if (day === '04') val = 2.0
  if (day === '05') val = 5.0
  if (day === '06') val = 3.0
  if (day === '07') val = 4.0
  if (day === '10') val = 3.0
  if (day === '11') val = 5.0
  if (day === '12') val = 2.0
  if (day === '13') val = 2.0
  if (day === '14') val = 5.0
  if (day === '15') val = 4.0
  return { day, count: val }
})

export const MOCK_ANALYTICS_KEYS_DATA = Array.from({ length: 31 }, (_, i) => {
  const day = (i + 1).toString().padStart(2, '0')
  let val = 0
  if (day === '08') val = 500
  return { day, count: val }
})
