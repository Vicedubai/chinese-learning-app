@echo off
chcp 65001 >nul
echo ========================================
echo XÓA TẤT CẢ COMMIT CŨ - TẠO LỊCH SỬ MỚI
echo ========================================
echo.

echo [1/6] Kiểm tra trạng thái hiện tại...
git status
echo.

echo [2/6] Tạo branch mới không có lịch sử...
git checkout --orphan latest_branch
echo.

echo [3/6] Add tất cả file hiện tại...
git add -A
echo.

echo [4/6] Tạo commit đầu tiên...
git commit -m "Initial commit - Clean history"
echo.

echo [5/6] Xóa branch main cũ...
git branch -D main
echo.

echo [6/6] Đổi tên branch mới thành main...
git branch -m main
echo.

echo ========================================
echo HOÀN TẤT! Bây giờ push lên GitHub:
echo.
echo git push -f origin main
echo ========================================
echo.
echo ⚠️ LƯU Ý: Lệnh này sẽ XÓA TẤT CẢ lịch sử commit cũ!
echo Chỉ chạy nếu bạn chắc chắn muốn xóa!
echo.
pause
