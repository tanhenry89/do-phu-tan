# Web Nghe Nhạc Online

Ứng dụng nghe nhạc online với backend Node.js, Express và SQLite.

## Tính năng

- Danh sách bài hát lưu trữ trong database SQLite
- API `GET /api/tracks` trả về playlist
- API `POST /api/tracks` thêm bài hát mới vào database
- Phát nhạc trực tiếp từ URL hoặc từ tệp audio trên máy
- Giao diện web tĩnh phục vụ bởi server Express

## Cài đặt và chạy

1. Mở terminal trong `D:\my-music-web`
2. Chạy `npm install` (nếu chưa cài)
3. Chạy `npm start`
4. Mở trình duyệt và truy cập `http://localhost:3000`

## Ghi chú

- Dữ liệu playlist được lưu trong `D:\my-music-web\data\music.db`
- Bạn có thể thêm bài hát mới bằng form "Thêm bài hát mới"
- Backend cũng phục vụ các file tĩnh như `index.html`, `styles.css` và `script.js`
