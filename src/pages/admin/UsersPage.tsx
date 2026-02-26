import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../../services/api';
import './AdminPage.css';

export function UsersPage() {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">회원 관리</h1>
        <p className="admin-page-description">등록된 회원 목록을 확인합니다.</p>
      </div>

      <div className="admin-table-wrapper">
        {isLoading ? (
          <div className="admin-state-box">불러오는 중...</div>
        ) : isError ? (
          <div className="admin-state-box error">회원 목록을 불러오지 못했습니다.</div>
        ) : !users || users.length === 0 ? (
          <div className="admin-state-box">등록된 회원이 없습니다.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이메일</th>
                <th>이름</th>
                <th>나이</th>
                <th>연락처</th>
                <th>역할</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.age}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.registeredAt).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
