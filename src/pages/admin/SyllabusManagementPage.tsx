import React, { useCallback, useEffect, useState } from 'react';
import {
  BookCopy,
  Plus,
  Save,
  Trash2,
  Video,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { useApp } from '../../context/AppContext';
import { ChuongHocItem, KhoaHoc } from '../../types/elearning';
import { getCourseSyllabus, saveCourseSyllabus } from '../../utils/courseHelpers';

export const SyllabusManagementPage: React.FC = () => {
  const { serverConfig, notify } = useApp();

  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState('');
  const [chapters, setChapters] = useState<ChuongHocItem[]>([]);

  const loadCourses = useCallback(async () => {
    const list = await elearningApi
      .layDanhSachKhoaHoc('', serverConfig.maNhom)
      .catch(() => []);
    setCourses(list);
    if (list.length > 0) {
      setSelectedCourseCode(list[0].maKhoaHoc);
      setChapters(getCourseSyllabus(list[0]));
    }
  }, [serverConfig.maNhom]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSelectCourse = (code: string) => {
    setSelectedCourseCode(code);
    const found = courses.find((c) => c.maKhoaHoc === code);
    if (found) {
      setChapters(getCourseSyllabus(found));
    }
  };

  const handleAddChapter = () => {
    const idx = chapters.length + 1;
    setChapters((prev) => [
      ...prev,
      {
        id: `chuong-${Date.now()}`,
        tenChuong: `Chương ${idx}: Nội dung chuyên đề mới`,
        danhSachBaiHoc: [],
      },
    ]);
  };

  const handleAddLesson = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const lessonIdx = ch.danhSachBaiHoc.length + 1;
        return {
          ...ch,
          danhSachBaiHoc: [
            ...ch.danhSachBaiHoc,
            {
              id: `${selectedCourseCode}-b-${Date.now()}`,
              tieuDe: `Bài ${lessonIdx}: Bài giảng mới`,
              thoiLuong: '15:00',
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              moTa: 'Tóm tắt nội dung thực hành của bài giảng.',
              mienPhi: true,
            },
          ],
        };
      })
    );
  };

  const handleSave = () => {
    if (!selectedCourseCode) return;
    saveCourseSyllabus(selectedCourseCode, chapters);
    notify(
      'success',
      'Đã lưu Đề cương & Danh sách bài học!',
      `Khóa học #${selectedCourseCode} đã được cập nhật đề cương mới.`
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <span className="section-eyebrow">
            TÍNH NĂNG MỞ RỘNG • QUẢN LÝ BÀI HỌC & TẠO ĐỀ CƯƠNG
          </span>
          <h2>Thiết Kế Đề Cương & Bài Giảng Khóa Học</h2>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          <Save size={16} /> Lưu đề cương khóa học
        </button>
      </div>

      <div className="content-card">
        <div className="admin-toolbar">
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label htmlFor="syl-course">Chọn khóa học cần biên tập đề cương</label>
            <select
              id="syl-course"
              value={selectedCourseCode}
              onChange={(e) => handleSelectCourse(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.maKhoaHoc} value={c.maKhoaHoc}>
                  {c.tenKhoaHoc} ({c.maKhoaHoc})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleAddChapter}
          >
            <Plus size={16} /> Thêm chương học mới
          </button>
        </div>

        <div className="syllabus-editor-list">
          {chapters.map((ch, cIdx) => (
            <div key={ch.id} className="syllabus-editor-chapter">
              <div className="syllabus-editor-chapter__head">
                <BookCopy size={18} />
                <input
                  type="text"
                  value={ch.tenChuong}
                  onChange={(e) => {
                    const val = e.target.value;
                    setChapters((prev) =>
                      prev.map((item, i) =>
                        i === cIdx ? { ...item, tenChuong: val } : item
                      )
                    );
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => handleAddLesson(ch.id)}
                >
                  <Plus size={14} /> Thêm bài học
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-xs"
                  onClick={() =>
                    setChapters((prev) => prev.filter((item) => item.id !== ch.id))
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="syllabus-editor-lessons">
                {ch.danhSachBaiHoc.map((lesson, lIdx) => (
                  <div key={lesson.id} className="syllabus-editor-lesson">
                    <Video size={16} />
                    <input
                      type="text"
                      placeholder="Tiêu đề bài học"
                      value={lesson.tieuDe}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChapters((prev) =>
                          prev.map((item, i) =>
                            i === cIdx
                              ? {
                                  ...item,
                                  danhSachBaiHoc: item.danhSachBaiHoc.map((b, j) =>
                                    j === lIdx ? { ...b, tieuDe: val } : b
                                  ),
                                }
                              : item
                          )
                        );
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Thời lượng (15:00)"
                      style={{ maxWidth: 110 }}
                      value={lesson.thoiLuong}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChapters((prev) =>
                          prev.map((item, i) =>
                            i === cIdx
                              ? {
                                  ...item,
                                  danhSachBaiHoc: item.danhSachBaiHoc.map((b, j) =>
                                    j === lIdx ? { ...b, thoiLuong: val } : b
                                  ),
                                }
                              : item
                          )
                        );
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-xs"
                      onClick={() =>
                        setChapters((prev) =>
                          prev.map((item, i) =>
                            i === cIdx
                              ? {
                                  ...item,
                                  danhSachBaiHoc: item.danhSachBaiHoc.filter(
                                    (_, j) => j !== lIdx
                                  ),
                                }
                              : item
                          )
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
