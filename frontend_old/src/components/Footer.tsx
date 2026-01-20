import 'bootstrap-icons/font/bootstrap-icons.css';

const Footer = () => {
  // Пока что простой футер, позже добавим функциональность трея
  return (
    <>
      {/* Tray Footer - показывается когда есть задачи/уведомления */}
      <footer className="tray" id="trayFooter" style={{ display: 'none' }}>
        <div className="tray-items-container" id="trayContainer">
          {/* Будет заполнено динамически */}
        </div>
        <div className="tray-more-container" id="trayMoreContainer" style={{ display: 'none' }}>
          <button className="tray-more-btn" id="trayMoreBtn">
            <i className="bi bi-three-dots"></i>
            <span className="tray-more-count" id="trayMoreCount">+0</span>
          </button>
          <div className="tray-dropdown" id="trayDropdown" style={{ display: 'none' }}></div>
        </div>
      </footer>
      
      {/* Empty Footer - показывается когда нет задач */}
      <footer className="tray-empty" id="emptyFooter">
        <span className="text-muted">© Иван Голубенко, 2023–2024 | HRM Pro v1.0</span>
        <span className="text-muted" id="footerLanguage">🇷🇺 Русский</span>
      </footer>
    </>
  );
};

export default Footer;

