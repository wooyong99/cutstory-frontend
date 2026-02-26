import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

export function MenusPage() {
  const navigate = useNavigate();

  const handleDelete = (_id: string) => {
    alert('메뉴 삭제 API가 아직 구현되지 않았습니다.');
  };

  // API 미구현 상태이므로 목업 데이터로 UI만 표시
  const mockMenus = [
    { id: '1', name: '남자 컷', category: '컷', price: 10000 },
    { id: '2', name: '여자 컷', category: '컷', price: 15000 },
    { id: '3', name: '뿌리 염색', category: '염색', price: 30000 },
    { id: '4', name: '전체 염색', category: '염색', price: 50000 },
    { id: '5', name: '다운펌', category: '펌', price: 20000 },
    { id: '6', name: '일반 펌', category: '펌', price: 50000 },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">메뉴 관리</h1>
            <p className="admin-page-description">메뉴 목록을 확인하고 관리합니다. (API 연동 예정)</p>
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
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>메뉴명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {mockMenus.map((menu) => (
              <tr key={menu.id}>
                <td>{menu.id}</td>
                <td>{menu.name}</td>
                <td>{menu.category}</td>
                <td>{menu.price.toLocaleString()}원</td>
                <td>
                  <button className="delete-button" onClick={() => handleDelete(menu.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
