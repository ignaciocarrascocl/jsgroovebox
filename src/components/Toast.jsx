import './Toast.css'

const Toast = ({ message, onUndo, onClose }) => {
  return (
    <div className="toast">
      <div className="toast-message">{message}</div>
      <div className="toast-actions">
        {onUndo && (
          <button className="toast-btn undo" onClick={onUndo}>Undo</button>
        )}
        <button className="toast-btn close" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  )
}

export default Toast
