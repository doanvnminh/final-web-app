const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
//const bodyParser = require('body-parser');
const session = require('express-session');

// Import Models
const User = require('./models/user');
const House = require('./models/house');
const Comment = require('./models/comments');
const SiteStat = require('./models/sitestat');
const Contact = require('./models/contact');

const app = express();

// --- 1. CONFIGURATION & DATABASE ---
mongoose.connect('mongodb://127.0.0.1:27017/thue_nha_db')
    .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối DB:', err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Session Config
app.use(session({
    secret: 'mySecretKey123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// --- 2. MIDDLEWARE ---

// A. Make user available to ALL EJS files
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// B. Global View Counter
app.use(async (req, res, next) => {
    // Only count for main pages, ignore static files like css/images
    if (req.method === 'GET' && !req.path.startsWith('/css') && !req.path.startsWith('/images')) {
        const stat = await SiteStat.findOne({ name: 'site_views' });
        if (!stat) await SiteStat.create({ name: 'site_views', count: 1 });
        else await SiteStat.findOneAndUpdate({ name: 'site_views' }, { $inc: { count: 1 } });
    }
    next();
});

// C. The Login Guard (Must be logged in)
const checkLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// D. The Admin Guard (Must be Admin)
const checkAdmin = (req, res, next) => {
    // Check session OR cookie
    const role = (req.session.user && req.session.user.role) || req.cookies.userRole;
    if (role === 'admin') next();
    else res.status(403).send('⛔ Bạn không có quyền truy cập trang này (Chỉ dành cho Admin)');
};


// --- 3. SEED DATA (FRESH START FOR EVERYTHING) ---
async function seedData() {
    // 1. Check/Create Admin
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        await User.create({ username: 'admin', password: '123', role: 'admin' });
        await User.create({ username: 'user1', password: '123', role: 'user' });
        console.log("⚡ Đã tạo tài khoản Admin.");
    }


    // //Temp block 
    // await House.deleteMany({});

    // // B. Wipe Old View Counter (The Fix!)
    // await SiteStat.deleteMany({});
    // await SiteStat.create({ name: 'site_views', count: 0 }); // Start fresh at 0
    // // End Temp block

    const houseCount = await House.countDocuments();
    if (houseCount > 0) {
        console.log("✅ Dữ liệu đã tồn tại. Bỏ qua bước tạo mẫu.");
        return;
    }



    await House.create([
        {
            title: 'Căn hộ Studio Cầu Giấy',
            price: '5tr/tháng',
            desc: 'Full nội thất, gần đại học Quốc Gia.',
            views: 0,
            image: 'house1.jpg',
            address: 'Số 8, Ngõ 123 Xuân Thủy, Cầu Giấy',
            contact_phone: '0988.111.222'
        },
        {
            title: 'Nhà nguyên căn Đống Đa',
            price: '12tr/tháng',
            desc: '3 tầng, mặt tiền thoáng, phù hợp kinh doanh.',
            views: 0,
            image: 'house2.jpg',
            address: 'Số 12, Ngõ 456 Kim Mã, Đống Đa',
            contact_phone: '0977.222.333'
        },
        // ... (Paste the rest of your 9 houses here) ...
        {
            title: 'Chung cư Mini Thanh Xuân',
            price: '4.5tr/tháng',
            desc: 'Có thang máy, bảo vệ 24/7.',
            views: 0,
            image: 'house3.jpg',
            address: 'Ngõ 72 Nguyễn Trãi, Thanh Xuân',
            contact_phone: '0912.333.444'
        },
        {
            title: 'Phòng trọ giá rẻ Hai Bà Trưng',
            price: '3tr/tháng',
            desc: 'Phòng khép kín, không chung chủ.',
            views: 0,
            image: 'house4.jpg',
            address: 'Số 18 Lê Thanh Nghị, Hai Bà Trưng',
            contact_phone: '0905.555.666'
        },
        {
            title: 'Căn hộ cao cấp Tây Hồ',
            price: '15tr/tháng',
            desc: 'View Hồ Tây, 2 phòng ngủ.',
            views: 0,
            image: 'house5.jpg',
            address: '24 Quảng An, Tây Hồ',
            contact_phone: '0999.888.777'
        },
        {
            title: 'Nhà trọ sinh viên Hoàng Mai',
            price: '2.5tr/tháng',
            desc: 'Giá rẻ, điện nước công tơ riêng.',
            views: 0,
            image: 'house6.jpg',
            address: 'Ngõ 15 Gốc Đề, Minh Khai',
            contact_phone: '0333.444.555'
        },
        {
            title: 'Văn phòng cho thuê Hà Đông',
            price: '8tr/tháng',
            desc: 'Sàn văn phòng 50m2, view đẹp.',
            views: 0,
            image: 'house7.jpg',
            address: 'KĐT Văn Quán, Hà Đông',
            contact_phone: '0966.777.888'
        },
        {
            title: 'Homestay Phố Cổ',
            price: '10tr/tháng',
            desc: 'Thiết kế vintage, trung tâm hoàn kiếm.',
            views: 0,
            image: 'house8.jpg',
            address: 'Hàng Bông, Hoàn Kiếm',
            contact_phone: '0911.222.333'
        },
        {
            title: 'Nhà cấp 4 Long Biên',
            price: '4tr/tháng',
            desc: 'Rộng rãi, có sân vườn nhỏ.',
            views: 0,
            image: 'house9.jpg',
            address: 'Ngọc Lâm, Long Biên',
            contact_phone: '0944.555.999'
        }
    ]);

    console.log("✅ Đã Reset toàn bộ: Houses = 0, Site Views = 0");
}


seedData();


// --- 4. ROUTES ---

// === HOME PAGE ===
app.get('/', async (req, res) => {
    try {
        const houses = await House.find({});
        res.render('home', { houses });
    } catch (e) { res.status(500).send(e.message); }
});

// === HOUSE DETAIL ===
app.get('/house/:id', async (req, res) => {
    try {
        // Increase view count for this specific house
        const house = await House.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });

        if (!house) return res.status(404).send('Không tìm thấy nhà');

        const comments = await Comment.find({ houseId: req.params.id });
        res.render('detail', { house, comments });
    } catch (e) { res.status(404).send('Lỗi ID không hợp lệ'); }
});

// === COMMENT SUBMISSION (Protected) ===
app.post('/house/:id/comment', checkLoggedIn, async (req, res) => {
    try {
        const { content, rating } = req.body;
        await Comment.create({
            houseId: req.params.id,
            name: req.session.user.username,
            email: 'user@email.com', // Placeholder
            content,
            rating
        });
        res.redirect(`/house/${req.params.id}`);
    } catch (e) { res.status(500).send('Lỗi gửi bình luận'); }
});

// === LOGIN ===
app.get('/login', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (user) {
        req.session.user = user; // Save to Session
        res.cookie('userRole', user.role); // Save cookie (for legacy check)

        if (user.role === 'admin') return res.redirect('/admin');
        return res.redirect('/');
    }
    res.send('Sai tài khoản hoặc mật khẩu. <a href="/login">Thử lại</a>');
});

// === LOGOUT ===
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('userRole');
    res.redirect('/');
});

// === CONTACT PAGE ===
app.get('/contact', (req, res) => {
    res.render('contact', { success: null });
});

app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await Contact.create({ name, email, message });
        res.render('contact', { success: 'Cảm ơn! Chúng tôi đã nhận được tin nhắn.' });
    } catch (e) {
        res.send('Lỗi gửi tin nhắn: ' + e.message);
    }
});

// === ADMIN DASHBOARD (Protected) ===
app.get('/admin', checkAdmin, async (req, res) => {
    try {
        // 1. Get Site Views
        const siteStat = await SiteStat.findOne({ name: 'site_views' });
        const globalViews = siteStat ? siteStat.count : 0;

        // 2. Get All Data
        const houses = await House.find({});
        const comments = await Comment.find({}).populate('houseId');
        const contacts = await Contact.find({}).sort({ date: -1 });

        // 3. Render
        res.render('admin', { globalViews, houses, comments, contacts });
    } catch (e) {
        res.status(500).send("Lỗi Server Admin: " + e.message);
    }
});

// === ADMIN ACTIONS ===

// Delete Comment
app.post('/admin/delete-comment', checkAdmin, async (req, res) => {
    const { commentId } = req.body;
    await Comment.findByIdAndDelete(commentId);
    res.redirect('/admin');
});

// Update House
app.post('/admin/update-house', checkAdmin, async (req, res) => {
    try {
        const { id, price, desc } = req.body;
        await House.findByIdAndUpdate(id, { price, desc });
        res.redirect('/admin');
    } catch (e) { res.status(500).send('Lỗi khi cập nhật nhà'); }
});


// --- 5. START SERVER ---
app.listen(3000, () => console.log('🚀 Server chạy tại http://localhost:3000'));