# Step-by-Step Test Guide

## How to Test All Fixes

### Prerequisites
- Application running at `http://localhost:8000`
- Browser with developer tools (F12)
- A test Gemini API key (optional, can use any string for testing)
- A YouTube video URL (optional)

---

## Test 1: Gemini API Key Save ✅

### Steps:
1. Open the application at `http://localhost:8000`
2. Look at the sidebar on the left
3. Find the button "🤖 Cài đặt AI" at the bottom of the sidebar
4. Click on it
5. A modal should appear with the title "🤖 Cài đặt Google Gemini AI"

### Expected Result:
- Modal opens smoothly
- Input field is visible with placeholder "AIzaSy..."
- Input field is focused (cursor is in the field)

### Continue:
6. Enter a test API key (e.g., `AIzaSyTest123456789`)
7. Click the "✅ Lưu và đóng" button
8. You should see a green success message: "✅ Đã lưu API Key"
9. The modal should close automatically

### Expected Result:
- Success message appears
- Modal closes
- No error messages in console (F12)

### Verify Persistence:
10. Click "🤖 Cài đặt AI" again
11. The API key you entered should still be there

### Expected Result:
- API key is displayed in the input field
- Confirms that the API key was saved to localStorage

---

## Test 2: Gemini Transcript Helper 🎬

### Prerequisites:
- Have a YouTube video URL ready (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)

### Steps:
1. Navigate to the "🎧 Nghe chép" (Dictation) page
2. Find the input field labeled "🔗 YouTube Link"
3. Enter a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
4. Look for the button "✏️ Tạo script thủ công"
5. Click on it

### Expected Result:
- Modal opens with title "✏️ Tạo Script Thủ Công với Gemini AI"
- YouTube link is displayed in the modal
- Prompt is shown in the textarea
- Transcript input is empty

### Continue:
6. Click the "🚀 Mở Gemini AI" button
7. You should see a success message: "✅ Đã copy prompt. Mở Gemini và paste vào"
8. A new tab should open with Gemini (https://gemini.google.com)

### Expected Result:
- Success message appears
- Gemini opens in a new tab
- Prompt is copied to clipboard

### In Gemini:
9. In the Gemini tab, paste the prompt (Ctrl+V or Cmd+V)
10. Gemini will generate a transcript
11. Copy the transcript from Gemini (Ctrl+C or Cmd+C)

### Back to App:
12. Return to the app tab
13. Paste the transcript into the "📋 Transcript" textarea (Ctrl+V or Cmd+V)
14. Click the "✅ Lưu & Đóng" button

### Expected Result:
- Success message appears: "✅ Đã lưu transcript. Bạn có thể bắt đầu luyện nghe!"
- Modal closes
- Transcript is saved to the dictation input
- No error messages in console (F12)

---

## Test 3: Book Management 📚

### Steps:
1. Navigate to the "📚 Giáo trình" (Library) page
2. Find a book in the list
3. Look for the ✏️ button next to the book name
4. Click on it

### Expected Result:
- Book name becomes editable (input field appears)
- Input field is focused
- Current book name is selected

### Continue:
5. Change the book name (e.g., add " - Test" to the end)
6. Press Enter to save

### Expected Result:
- Book name is updated
- Input field is replaced with the new name
- Success message appears: "✅ Đã đổi tên thành..."
- Change is saved to localStorage

### Verify Persistence:
7. Refresh the page (F5)
8. The book name should still be the new name

### Expected Result:
- Book name persists after page reload

### Test Drag & Drop:
9. Find two books in the list
10. Click and hold on one book
11. Drag it to a different position
12. Release the mouse

### Expected Result:
- Book moves to the new position
- Visual feedback during drag (opacity, scale, border)
- Change is saved to localStorage

---

## Test 4: F5 Reload - Keep Current Page 🔄

### Steps:
1. Navigate to the "🃏 Flashcard" page
2. Press F5 to reload the page

### Expected Result:
- Page reloads
- You stay on the Flashcard page (not Dashboard)
- No error messages in console (F12)

### Continue:
3. Scroll down on the page
4. Press F5 to reload

### Expected Result:
- Page reloads
- Scroll position is restored (you're at the same scroll position)

### Test with Different Pages:
5. Navigate to "📚 Giáo trình" (Library)
6. Press F5
7. Verify you stay on Library page

8. Navigate to "✏️ Bài tập" (Exercises)
9. Press F5
10. Verify you stay on Exercises page

### Expected Result:
- All pages are preserved on F5 reload
- Scroll position is preserved
- Session data is maintained

---

## Browser Console Check 🔍

After each test, check the browser console for errors:

1. Press F12 to open developer tools
2. Click on the "Console" tab
3. Look for any red error messages

### Expected Result:
- No red error messages
- Only info/warning messages are acceptable
- Messages like "ℹ️ Supabase not configured" are normal

---

## Troubleshooting 🔧

### Issue: Modal doesn't open
**Solution**:
1. Check browser console (F12) for errors
2. Clear localStorage: `localStorage.clear()`
3. Refresh the page
4. Try again

### Issue: API key doesn't save
**Solution**:
1. Check browser console (F12) for errors
2. Make sure you entered a value in the input field
3. Make sure you clicked the "✅ Lưu và đóng" button
4. Try again

### Issue: Transcript doesn't save
**Solution**:
1. Check browser console (F12) for errors
2. Make sure you pasted content into the transcript textarea
3. Make sure you clicked the "✅ Lưu & Đóng" button
4. Try again

### Issue: Book name doesn't save
**Solution**:
1. Check browser console (F12) for errors
2. Make sure you pressed Enter after editing
3. Refresh the page to verify it was saved
4. Try again

### Issue: F5 doesn't keep current page
**Solution**:
1. Check browser console (F12) for errors
2. Make sure you're using F5 (not Ctrl+R or Cmd+R)
3. Clear sessionStorage: `sessionStorage.clear()`
4. Refresh the page
5. Try again

---

## Summary Checklist ✅

- [ ] Gemini API Key Save works
- [ ] Gemini Transcript Helper works
- [ ] Book Management works
- [ ] F5 Reload keeps current page
- [ ] No error messages in console
- [ ] All changes persist after page reload

---

## Next Steps

If all tests pass:
1. ✅ Application is ready for production
2. ✅ All features are working correctly
3. ✅ No breaking changes

If any test fails:
1. Check the troubleshooting section
2. Check browser console for error messages
3. Contact support with error details

---

## Support

For detailed information, see:
- `FIXES_APPLIED_SUMMARY.md` - Complete technical summary
- `QUICK_FIX_SUMMARY.md` - Quick reference
- `TEST_FIXES_VERIFICATION.md` - Detailed testing guide

---

## Questions?

If you have any questions or issues, please:
1. Check the browser console (F12) for error messages
2. Review the troubleshooting section above
3. Refer to the documentation files
4. Contact support with error details and steps to reproduce

---

**Good luck with testing! 🚀**
