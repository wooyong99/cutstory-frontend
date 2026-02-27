import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchMenusByCategory } from '../../services/api';
import type { MenuListResponse } from '../../types';
import './AdminPage.css';

interface MenuWithCategory extends MenuListResponse {
  categoryName: string;
}

export function MenusPage() {
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchCategories,
  });

  const { data: allMenus, isLoading, isError } = useQuery<MenuWithCategory[]>({
    queryKey: ['admin', 'menus'],
    queryFn: async () => {
      const results = await Promise.all(
        (categories ?? []).map(async (cat) => {
          const menus = await fetchMenusByCategory(cat.id);
          return menus.map((m) => ({ ...m, categoryName: cat.name }));
        }),
      );
      return results.flat();
    },
    enabled: !!categories && categories.length > 0,
  });

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">메뉴 관리</h1>
            <p className="admin-page-description">메뉴 목록을 확인하고 관리합니다.</p>
          </div>
          <button
            className="admin-create-button"
            onClick={() => navigate('/admin/menus/create')}
          >
            메뉴 생성하기
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {isLoading ? (
          <div className="admin-state-box">불러오는 중...</div>
        ) : isError ? (
          <div className="admin-state-box error">메뉴 목록을 불러오지 못했습니다.</div>
        ) : !allMenus || allMenus.length === 0 ? (
          <div className="admin-state-box">등록된 메뉴가 없습니다.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>메뉴명</th>
                <th>카테고리</th>
                <th>가격</th>
              </tr>
            </thead>
            <tbody>
              {allMenus.map((menu) => (
                <tr key={menu.id}>
                  <td>{menu.id}</td>
                  <td>{menu.name}</td>
                  <td>{menu.categoryName}</td>
                  <td>{menu.price.toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
