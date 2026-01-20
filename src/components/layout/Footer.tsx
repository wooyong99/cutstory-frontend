import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 상단 영역 */}
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              CutStory
            </Link>
            <p className="footer-tagline">
              당신만의 스타일을 찾아드립니다
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-link-group">
              <h4 className="footer-link-title">서비스</h4>
              <Link to="/" className="footer-link">메뉴 & 가격</Link>
              <Link to="/" className="footer-link">예약하기</Link>
            </div>
            <div className="footer-link-group">
              <h4 className="footer-link-title">고객지원</h4>
              <a href="tel:02-1234-5678" className="footer-link">전화 문의</a>
              <a href="mailto:contact@cutstory.kr" className="footer-link">이메일 문의</a>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="footer-divider" />

        {/* 사업자 정보 */}
        <div className="footer-business">
          <div className="footer-business-info">
            <p className="business-name">컷스토리 헤어살롱</p>
            <div className="business-details">
              <span>대표: 홍길동</span>
              <span className="divider">|</span>
              <span>사업자등록번호: 123-45-67890</span>
            </div>
            <div className="business-details">
              <span>주소: 서울특별시 강남구 테헤란로 123, 2층</span>
            </div>
            <div className="business-details">
              <span>전화: 02-1234-5678</span>
              <span className="divider">|</span>
              <span>이메일: contact@cutstory.kr</span>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} CutStory. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#" className="legal-link">이용약관</a>
            <a href="#" className="legal-link">개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
