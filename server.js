const express = require('express');
const mongoose = require('mongoose'); // Import Mongoose
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Import Models
const User = require('./models/user');
const House = require('./models/house');
const Comment = require('./models/comments');
const SiteStat = require('./models/sitestat');

const app = express();

// --- KẾT NỐI MONGODB ---
mongoose.connect('mongodb://127.0.0.1:27017/thue_nha_db')
    .then(() => console.log('Đã kết nối MongoDB thành công!'))
    .catch(err => console.error('Lỗi kết nối DB:', err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// --- HÀM TẠO DỮ LIỆU MẪU (SEED DATA) ---
// Chạy 1 lần để tạo Admin và vài căn nhà nếu DB trống
async function seedData() {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        await User.create({ username: 'admin', password: '123', role: 'admin' });
        await User.create({ username: 'user1', password: '123', role: 'user' });
        console.log("Đã tạo tài khoản Admin mặc định.");
    }

    const houseCount = await House.countDocuments();
    if (houseCount === 0) {
        await House.create([
            { title: 'Căn hộ Studio Cầu Giấy', price: '5tr/tháng', desc: 'Full nội thất, gần đại học', views: 10 },
            { title: 'Nhà nguyên căn Đống Đa', price: '12tr/tháng', desc: '3 tầng, tiện kinh doanh', views: 50 }
        ]);
        console.log("Đã tạo dữ liệu nhà mẫu.");
    }

    // Tạo bộ đếm view nếu chưa có
    const stat = await SiteStat.findOne({ name: 'site_views' });
    if (!stat) await SiteStat.create({ name: 'site_views', count: 0 });
}
seedData();

// --- MIDDLEWARE TĂNG VIEW TOÀN WEB ---
app.use(async (req, res, next) => {
    // Tìm và tăng view lên 1
    await SiteStat.findOneAndUpdate({ name: 'site_views' }, { $inc: { count: 1 } });
    next();
});

// --- ROUTES (Đã chuyển sang Async/Await) ---

// 1. Trang chủ
app.get('/', async (req, res) => {
    try {
        const houses = await House.find({}); // Lấy tất cả nhà từ DB
        res.render('home', { houses });
    } catch (e) { res.status(500).send(e.message); }
});

// 2. Chi tiết + Form bình luận
app.get('/house/:id', async (req, res) => {
    try {
        const houseId = req.params.id;

        // Tăng view cho bài viết (Yêu cầu hiển thị nội dung theo mã)
        const house = await House.findByIdAndUpdate(houseId, { $inc: { views: 1 } }, { new: true });

        if (!house) return res.status(404).send('Không tìm thấy nhà');

        // Lấy bình luận của nhà này
        const comments = await Comment.find({ houseId: houseId });

        res.render('detail', { house, comments });
    } catch (e) { res.status(404).send('Lỗi ID không hợp lệ'); }
});

// Xử lý gửi bình luận
app.post('/house/:id/comment', async (req, res) => {
    try {
        const { name, email, content, rating } = req.body;
        await Comment.create({
            houseId: req.params.id,
            name, email, content, rating
        });
        res.redirect(`/house/${req.params.id}`);
    } catch (e) { res.status(500).send('Lỗi gửi bình luận'); }
});

// 3. Đăng nhập
app.get('/login', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Tìm user trong DB
    const user = await User.findOne({ username, password });

    if (user) {
        res.cookie('userRole', user.role);
        if (user.role === 'admin') return res.redirect('/admin');
        return res.redirect('/');
    }
    res.send('Sai tài khoản hoặc mật khẩu');
});

// Middleware check Admin (Không đổi logic, chỉ đổi cách dùng)
const checkAdmin = (req, res, next) => {
    if (req.cookies.userRole === 'admin') next();
    else res.status(403).send('Chỉ dành cho Admin');
};

// 4. Trang Quản trị
app.get('/admin', checkAdmin, async (req, res) => {
    try {
        // Lấy thống kê view toàn trang
        const siteStat = await SiteStat.findOne({ name: 'site_views' });
        const globalViews = siteStat ? siteStat.count : 0;

        const houses = await House.find({});
        // Lấy toàn bộ comment để admin quản lý (Yêu cầu: Cho phép hiện danh sách, xoá bình luận)
        const comments = await Comment.find({}).populate('houseId'); // populate để lấy tên nhà nếu cần

        res.render('admin', { globalViews, houses, comments });
    } catch (e) { res.status(500).send(e.message); }
});

// Xóa bình luận
app.post('/admin/delete-comment', checkAdmin, async (req, res) => {
    const { commentId } = req.body;
    await Comment.findByIdAndDelete(commentId);
    res.redirect('/admin');
});

// Route xử lý cập nhật thông tin nhà (POST)
// Yêu cầu: Cho phép cập nhật thông tin ở các trang nội dung
app.post('/admin/update-house', checkAdmin, async (req, res) => {
    try {
        const { id, price, desc } = req.body;

        // Tìm theo _id và cập nhật
        await House.findByIdAndUpdate(id, {
            price: price,
            desc: desc
        });

        // Cập nhật xong thì quay lại trang admin
        res.redirect('/admin');
    } catch (e) {
        console.error(e);
        res.status(500).send('Lỗi khi cập nhật thông tin');
    }
});

// Cập nhật thông tin nhà (Yêu cầu: Cho phép cập nhật thông tin)
// Bạn cần tạo thêm route POST update ở đây nếu muốn hoàn thiện
// Ví dụ: app.post('/admin/edit-house/:id', ...)

// 5. Trang Liên hệ
app.get('/contact', (req, res) => res.render('contact'));

app.listen(3000, () => console.log('Server chạy tại http://localhost:3000'));