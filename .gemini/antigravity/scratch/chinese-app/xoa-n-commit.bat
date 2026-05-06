@echo off
chcp 65001 >nul
echo ========================================
echo XÓA N COMMIT GẦN NHẤT
echo ========================================
echo.

echo Xem 10 commit gần nhất:
git log --oneline -10
echo.

set /p N="Nhập số commit muốn xóa (ví dụ: 5): "
echo.

echo Bạn muốn xóa %N% commit gần nhất.
echo.
set /p CONFIRM="Xác nhận? (y/n): "

if /i "%CONFIRM%" NEQ "y" (
    echo Đã hủy!
    pause
    exit /b
)

echo.
echo Đang xóa %N% commit...
git reset --hard HEAD~%N%
echo.

echo ========================================
echo HOÀN TẤT! Bây giờ push lên GitHub:
echo.
echo git push -f origin main
echo ========================================
echo.
pause
