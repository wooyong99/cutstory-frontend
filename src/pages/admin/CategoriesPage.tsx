import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory, deleteCategory } from '../../services/api';
import { Modal } from '../../components/common';
import './AdminPage.css';

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setIsModalOpen(false);
      setCategoryName('');
    },
  });

  const handleCreate = () => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    createMutation.mutate({ name: trimmed });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleDelete = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">카테고리 관리</h1>
            <p className="admin-page-description">카테고리 목록을 확인하고 관리합니다.</p>
          </div>
          <button className="admin-create-button" onClick={() => setIsModalOpen(true)}>
            카테고리 생성
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {isLoading ? (
          <div className="admin-state-box">불러오는 중...</div>
        ) : isError ? (
          <div className="admin-state-box error">카테고리 목록을 불러오지 못했습니다.</div>
        ) : !categories || categories.length === 0 ? (
          <div className="admin-state-box">등록된 카테고리가 없습니다.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>카테고리명</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleDelete(category.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="카테고리 생성">
        <div className="modal-form">
          <label className="modal-label" htmlFor="category-name">
            카테고리 이름
          </label>
          <input
            id="category-name"
            className="modal-input"
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="카테고리 이름을 입력하세요"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          {createMutation.isError && (
            <p className="modal-error">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : '카테고리 생성에 실패했습니다.'}
            </p>
          )}
          <button
            className="admin-create-button modal-submit-button"
            onClick={handleCreate}
            disabled={!categoryName.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? '생성 중...' : '생성'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
