import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createMenu, fetchCategories } from '../../services/api';
import type { CreateMenuOptionRequest } from '../../types';
import './AdminPage.css';

interface OptionForm {
  name: string;
  duration: string;
  price: string;
  description: string;
}

const emptyOption: OptionForm = { name: '', duration: '', price: '', description: '' };

export function MenuCreatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [price, setPrice] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [detailImages, setDetailImages] = useState<string[]>(['']);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [options, setOptions] = useState<OptionForm[]>([]);

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      navigate('/admin/menus');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedOptions: CreateMenuOptionRequest[] = options
      .filter((o) => o.name.trim())
      .map((o) => ({
        name: o.name.trim(),
        duration: parseInt(o.duration, 10) || 0,
        price: parseInt(o.price, 10) || 0,
        description: o.description.trim(),
      }));

    mutation.mutate({
      name: name.trim(),
      description: description.trim(),
      minDuration: parseInt(minDuration, 10) || 0,
      maxDuration: parseInt(maxDuration, 10) || 0,
      price: parseInt(price, 10) || 0,
      mainImage: mainImage.trim(),
      detailImages: detailImages.map((url) => url.trim()).filter(Boolean),
      options: parsedOptions,
      categoryIds: selectedCategoryIds,
    });
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  // 상세 이미지 관리
  const addDetailImage = () => setDetailImages((prev) => [...prev, '']);
  const removeDetailImage = (index: number) =>
    setDetailImages((prev) => prev.filter((_, i) => i !== index));
  const updateDetailImage = (index: number, value: string) =>
    setDetailImages((prev) => prev.map((url, i) => (i === index ? value : url)));

  // 옵션 관리
  const addOption = () => setOptions((prev) => [...prev, { ...emptyOption }]);
  const removeOption = (index: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== index));
  const updateOption = (index: number, field: keyof OptionForm, value: string) =>
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));

  const isValid =
    name.trim() &&
    minDuration &&
    maxDuration &&
    price;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">메뉴 생성</h1>
        <p className="admin-page-description">새로운 메뉴를 등록합니다.</p>
      </div>

      <div className="admin-form-wrapper">
        <form onSubmit={handleSubmit}>
          {/* 기본 정보 */}
          <div className="form-section">
            <h3 className="form-section-title">기본 정보</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="menu-name">메뉴명 *</label>
              <input
                id="menu-name"
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="메뉴명을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="menu-desc">설명</label>
              <textarea
                id="menu-desc"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="메뉴 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="min-duration">최소 소요시간(분) *</label>
                <input
                  id="min-duration"
                  className="form-input"
                  type="number"
                  value={minDuration}
                  onChange={(e) => setMinDuration(e.target.value)}
                  placeholder="30"
                  min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="max-duration">최대 소요시간(분) *</label>
                <input
                  id="max-duration"
                  className="form-input"
                  type="number"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(e.target.value)}
                  placeholder="60"
                  min={0}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="menu-price">가격(원) *</label>
                <input
                  id="menu-price"
                  className="form-input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="10000"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* 이미지 */}
          <div className="form-section">
            <h3 className="form-section-title">이미지</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="main-image">대표 이미지 URL</label>
              <input
                id="main-image"
                className="form-input"
                type="text"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label className="form-label">상세 이미지 URL</label>
              {detailImages.map((url, index) => (
                <div key={index} className="form-dynamic-row">
                  <input
                    className="form-input"
                    type="text"
                    value={url}
                    onChange={(e) => updateDetailImage(index, e.target.value)}
                    placeholder="https://example.com/detail.jpg"
                  />
                  <button
                    type="button"
                    className="form-remove-button"
                    onClick={() => removeDetailImage(index)}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button type="button" className="form-add-button" onClick={addDetailImage}>
                + 이미지 추가
              </button>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="form-section">
            <h3 className="form-section-title">카테고리</h3>
            <div className="form-checkbox-group">
              {categories?.map((cat) => (
                <label key={cat.id} className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="form-hint">등록된 카테고리가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 옵션 */}
          <div className="form-section">
            <h3 className="form-section-title">옵션</h3>
            {options.map((opt, index) => (
              <div key={index} className="form-option-card">
                <div className="form-option-header">
                  <span className="form-option-index">옵션 {index + 1}</span>
                  <button
                    type="button"
                    className="form-remove-button"
                    onClick={() => removeOption(index)}
                  >
                    삭제
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">옵션명</label>
                    <input
                      className="form-input"
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOption(index, 'name', e.target.value)}
                      placeholder="옵션명"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">소요시간(분)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={opt.duration}
                      onChange={(e) => updateOption(index, 'duration', e.target.value)}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">가격(원)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={opt.price}
                      onChange={(e) => updateOption(index, 'price', e.target.value)}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">설명</label>
                  <input
                    className="form-input"
                    type="text"
                    value={opt.description}
                    onChange={(e) => updateOption(index, 'description', e.target.value)}
                    placeholder="옵션 설명"
                  />
                </div>
              </div>
            ))}
            <button type="button" className="form-add-button" onClick={addOption}>
              + 옵션 추가
            </button>
          </div>

          {/* 에러 */}
          {mutation.isError && (
            <p className="form-error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : '메뉴 생성에 실패했습니다.'}
            </p>
          )}

          {/* 버튼 */}
          <div className="form-actions">
            <button
              type="button"
              className="form-cancel-button"
              onClick={() => navigate('/admin/menus')}
            >
              취소
            </button>
            <button
              type="submit"
              className="admin-create-button"
              disabled={!isValid || mutation.isPending}
            >
              {mutation.isPending ? '생성 중...' : '메뉴 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
