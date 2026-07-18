import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  UserCheck, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Mail, 
  Lock, 
  User, 
  Briefcase,
  AlertTriangle,
  Camera
} from 'lucide-react';
import { AppContext } from '../contexts/AppContext';

const Accounts = () => {
  // Sử dụng dữ liệu và hàm từ Context API (đổi tên biến users thành staffList cho tiện)
  const { users: staffList, addUser, updateUser, deleteUser, activeUser } = React.useContext(AppContext);

  // Chặn user không phải Admin vào trang này qua link trực tiếp
  if (activeUser?.department !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  // States quản lý Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, email: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });

  // States quản lý dữ liệu Add Form
  const [addForm, setAddForm] = useState({
    name: '',
    department: 'Kho hàng',
    email: '',
    password: '',
    avatar: ''
  });
  const [addEmailError, setAddEmailError] = useState('');
  const [addEmailUsername, setAddEmailUsername] = useState('');
  const [editEmailUsername, setEditEmailUsername] = useState('');

  // States quản lý dữ liệu Edit/RBAC Form
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    department: '',
    isActive: true,
    email: '',
    avatar: '',
    permissions: {}
  });
  const [editEmailError, setEditEmailError] = useState('');

  // Dữ liệu đã được nạp tự động từ AppContext, không cần useEffect gọi getusers nữa

  // Kiểm tra định dạng Email (@odsstore.vn)
  const validateEmail = (emailVal, setErrorFn) => {
    if (!emailVal) {
      setErrorFn('');
      return false;
    }
    const regex = /^[a-zA-Z0-9._%+-]+@odsstore\.vn$/;
    if (!regex.test(emailVal)) {
      setErrorFn('Email không hợp lệ. Bắt buộc phải có đuôi @odsstore.vn (Ví dụ: nguyenvana@odsstore.vn)');
      return false;
    } else {
      setErrorFn('');
      return true;
    }
  };

  const handleAddEmailChange = (e) => {
    const val = e.target.value;
    setAddForm({ ...addForm, email: val });
    validateEmail(val, setAddEmailError);
  };

  const handleEditEmailChange = (e) => {
    const val = e.target.value;
    setEditForm({ ...editForm, email: val });
    validateEmail(val, setEditEmailError);
  };

  // Mở modal thêm mới
  const openAddModal = () => {
    setAddForm({ name: '', department: 'Bán hàng', email: '', password: '', avatar: '' });
    setAddEmailUsername('');
    setAddEmailError('');
    setIsAddModalOpen(true);
  };

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditForm({ ...editForm, avatar: reader.result });
        } else {
          setAddForm({ ...addForm, avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Submit Thêm nhân viên mới
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(addForm.email, setAddEmailError)) return;

    // Tìm ID lớn nhất để tự động tăng
    const maxId = staffList.length > 0 ? Math.max(...staffList.map(s => s.id)) : 0;

    const newStaff = {
      id: maxId + 1,
      name: addForm.name,
      department: addForm.department,
      email: addForm.email,
      password: addForm.password || 'password123', // Lưu mật khẩu khởi tạo
      avatar: addForm.avatar,
      isActive: true,
      permissions: {
        viewStock: addForm.department === 'Kho hàng' || addForm.department === 'Bán hàng' || addForm.department === 'Admin',
        addProduct: addForm.department === 'Kho hàng' || addForm.department === 'Bán hàng' || addForm.department === 'Admin',
        importImei: addForm.department === 'Kho hàng' || addForm.department === 'Admin',
        createOrderPos: addForm.department === 'Bán hàng' || addForm.department === 'Admin',
        editOrder: addForm.department === 'Bán hàng' || addForm.department === 'Admin',
        cancelOrder: addForm.department === 'Admin',
        viewRevenue: addForm.department === 'Admin',
        exportExcel: addForm.department === 'Admin',
        viewCustomers: addForm.department === 'Bán hàng' || addForm.department === 'Admin'
      }
    };

    addUser(newStaff);
    
    // Gắn Log kiểm tra
    console.log('Đã lưu thành công qua Context API:', newStaff);
    
    setIsAddModalOpen(false);
    setAlertModal({ isOpen: true, type: 'success', message: 'Thêm nhân viên thành công!' });
  };

  // Mở modal sửa đổi/RBAC
  const openEditModal = (staff) => {
    setEditForm({
      id: staff.id,
      name: staff.name,
      department: staff.department,
      isActive: staff.isActive,
      email: staff.email,
      password: '', // Trường nhập mật khẩu mới
      avatar: staff.avatar || '',
      permissions: { ...staff.permissions }
    });
    setEditEmailUsername(staff.email ? staff.email.split('@')[0] : '');
    setEditEmailError('');
    setIsEditModalOpen(true);
  };

  const handleEditDepartmentChange = (e) => {
    const newDept = e.target.value;
    let newPermissions = { ...editForm.permissions };
    if (newDept === 'Admin') {
      newPermissions = {
        viewStock: true, addProduct: true, importImei: true,
        createOrderPos: true, editOrder: true, cancelOrder: true,
        viewRevenue: true, exportExcel: true, viewCustomers: true
      };
    } else if (newDept === 'Bán hàng') {
      newPermissions = {
        viewStock: true, addProduct: true, importImei: false,
        createOrderPos: true, editOrder: true, cancelOrder: false,
        viewRevenue: false, exportExcel: false, viewCustomers: true
      };
    } else if (newDept === 'Kho hàng') {
      newPermissions = {
        viewStock: true, addProduct: true, importImei: true,
        createOrderPos: false, editOrder: false, cancelOrder: false,
        viewRevenue: false, exportExcel: false, viewCustomers: false
      };
    }
    setEditForm({ ...editForm, department: newDept, permissions: newPermissions });
  };

  // Toggle switch quyền hạn trong Edit Modal
  const handleTogglePermission = (key) => {
    setEditForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  // 3. Submit cập nhật nhân viên & phân quyền
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(editForm.email, setEditEmailError)) return;

    const currentStaff = staffList.find(s => s.id === editForm.id);
    const updatedStaff = {
      ...currentStaff,
      name: editForm.name,
      department: editForm.department,
      isActive: editForm.isActive,
      email: editForm.email,
      avatar: editForm.avatar,
      permissions: editForm.permissions
    };

    if (editForm.password && editForm.password.trim() !== '') {
      updatedStaff.password = editForm.password.trim();
    }

    updateUser(updatedStaff);
    
    console.log('Đã cập nhật & đồng bộ thông tin nhân sự qua Context:', updatedStaff);
    setIsEditModalOpen(false);
    setAlertModal({ isOpen: true, type: 'success', message: 'Cập nhật quyền thành công!' });
  };

  // 3. Xóa tài khoản nhân viên
  const handleDeleteStaff = (id, email) => {
    if (email === 'admin@odsstore.vn' || id === 3) {
      alert('Không được phép xóa tài khoản Admin gốc của hệ thống!');
      return;
    }
    setDeleteModal({ isOpen: true, id, email });
  };

  const confirmDeleteStaff = () => {
    deleteUser(deleteModal.id);
    console.log(`Đã xóa & cập nhật danh sách qua Context. ID nhân viên: ${deleteModal.id}`);
    setDeleteModal({ isOpen: false, id: null, email: '' });
    setAlertModal({ isOpen: true, type: 'success', message: 'Xóa tài khoản thành công!' });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Button thêm mới */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Quản lý Nhân sự & Phân quyền</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Thiết lập hồ sơ nhân viên và cấu hình quyền hạn nghiệp vụ</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-[#0052ff] hover:bg-[#0042d1] text-white shadow-md shadow-[#0052ff]/10 border border-transparent active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          THÊM NHÂN VIÊN
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                <th className="p-4 font-bold uppercase tracking-wider">Nhân viên</th>
                <th className="p-4 font-bold uppercase tracking-wider">Email liên kết</th>
                <th className="p-4 font-bold uppercase tracking-wider">Bộ phận</th>
                <th className="p-4 font-bold uppercase tracking-wider">Trạng thái</th>
                <th className="p-4 font-bold uppercase tracking-wider">Quyền hạn sở hữu</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 transition-colors">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                  
                  {/* Name & Initials */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#E6F0FF] dark:bg-[#0052ff]/20 text-[#0052ff] dark:text-[#6699ff] flex items-center justify-center font-extrabold text-xs overflow-hidden shrink-0">
                        {staff.avatar ? (
                          <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                        ) : (
                          staff.name.split(' ').pop().charAt(0)
                        )}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{staff.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-semibold">{staff.email}</td>

                  {/* Department */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {staff.department}
                    </span>
                  </td>

                  {/* Active Status Badge */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      staff.isActive 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' 
                        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {staff.isActive ? 'Đang hoạt động' : 'Khóa tài khoản'}
                    </span>
                  </td>

                  {/* Count Active Permissions */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#E6F0FF] dark:bg-[#0052ff]/20 text-[#0052ff] dark:text-[#6699ff] border border-[#0052ff]/10 dark:border-[#0052ff]/30">
                      {Object.values(staff.permissions).filter(Boolean).length} quyền được cấp
                    </span>
                  </td>

                  {/* Edit/Delete Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(staff)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-[#E6F0FF] dark:hover:bg-[#0052ff]/20 text-slate-400 dark:text-slate-400 hover:text-[#0052ff] dark:hover:text-[#6699ff] border border-slate-200 dark:border-slate-600 hover:border-[#0052ff]/20 dark:hover:border-[#0052ff]/30 transition-all flex items-center gap-1 font-bold text-[10px]"
                        title="Chỉnh sửa & Cấp quyền"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteStaff(staff.id, staff.email)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines footer */}
      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-start gap-3 transition-colors">
        <Shield className="w-5 h-5 text-[#0052ff] dark:text-[#6699ff] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#0052ff] dark:text-[#6699ff] uppercase tracking-wide">Nguyên tắc bảo vệ tài nguyên</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Việc phân cấp quyền hạn giúp nhân viên chỉ truy cập đúng các module thuộc thẩm quyền. Chỉ những email thuộc tên miền công ty <span className="text-[#0052ff] dark:text-[#6699ff] font-bold">@odsstore.vn</span> mới được phép khởi tạo và phân quyền trên hệ thống.</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL THÊM NHÂN VIÊN MỚI */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col transition-colors">
            
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0052ff]" />
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Đăng ký nhân sự mới</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              
              {/* Họ tên */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Họ và tên *</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-[#0052ff] transition-colors">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="Nhập họ và tên nhân viên..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-800 dark:text-white placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-[#0052ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Ảnh đại diện */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ảnh đại diện</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 transition-colors">
                    {addForm.avatar ? (
                      <img src={addForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#E6F0FF] file:text-[#0052ff] hover:file:bg-[#d5e6ff] transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Bộ phận & Vai trò */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bộ phận / Chức vụ</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-[#0052ff] transition-colors">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <select
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-[#0052ff] focus:outline-none transition-all"
                  >
                    <option value="Bán hàng">Bán hàng (Sales Assistant)</option>
                    <option value="Admin">Hệ thống (Administrator)</option>
                  </select>
                </div>
              </div>

              {/* Email đăng nhập */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email đăng nhập *</label>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 overflow-hidden focus-within:border-[#0052ff] focus-within:bg-white dark:focus-within:bg-slate-700 transition-all">
                  <span className="pl-3 pr-2 flex items-center text-slate-400 group-focus-within:text-[#0052ff]">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={addEmailUsername}
                    onChange={(e) => {
                      const val = e.target.value.replace(/@.*/, '').trim().toLowerCase();
                      setAddEmailUsername(val);
                      setAddForm({ ...addForm, email: val ? `${val}@odsstore.vn` : '' });
                      validateEmail(val ? `${val}@odsstore.vn` : '', setAddEmailError);
                    }}
                    placeholder="tên_nhân_viên"
                    className="flex-1 py-2 bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                  <span className="px-3 bg-slate-200/60 dark:bg-slate-600/60 text-[11px] text-slate-500 dark:text-slate-400 font-extrabold flex items-center border-l border-slate-200 dark:border-slate-600">
                    @odsstore.vn
                  </span>
                </div>
                {/* Text error hiển thị lỗi miền khi sai format */}
                {addEmailError && (
                  <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>{addEmailError}</span>
                  </p>
                )}
              </div>

              {/* Mật khẩu khởi tạo */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mật khẩu khởi tạo *</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-[#0052ff] transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Nhập mật khẩu mặc định..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-800 dark:text-white placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-[#0052ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={!!addEmailError || !addForm.email}
                  className={`px-4 py-2.5 text-xs font-bold rounded-lg text-white transition-all
                    ${(!!addEmailError || !addForm.email) 
                      ? 'bg-slate-300 border-transparent cursor-not-allowed' 
                      : 'bg-[#0052ff] hover:bg-[#0042d1] shadow-md shadow-[#0052ff]/10 active:scale-95'
                    }
                  `}
                >
                  ĐĂNG KÝ TÀI KHOẢN
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CHỈNH SỬA & RBAC CHI TIẾT */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
            
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0 transition-colors">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0052ff]" />
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Cập nhật tài khoản & Phân quyền</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Container */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* PHẦN 1: Thông tin chung */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-[#0052ff] uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Phần 1: Thông tin nhân sự</h4>
                
                {/* Ảnh đại diện Edit */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 shadow-sm transition-colors">
                    {editForm.avatar ? (
                      <img src={editForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ảnh đại diện</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#E6F0FF] file:text-[#0052ff] hover:file:bg-[#d5e6ff] transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tên */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-[#0052ff] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Email đăng nhập {editForm.email === 'admin@odsstore.vn' ? '(Khóa Super Admin)' : '*'}
                    </label>
                    <div className={`flex rounded-lg border dark:border-slate-600 overflow-hidden focus-within:border-[#0052ff] transition-all
                      ${editForm.email === 'admin@odsstore.vn' 
                        ? 'bg-slate-100 dark:bg-slate-700/80 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-600 font-semibold shadow-inner pointer-events-none' 
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white border-slate-200 dark:border-slate-600 focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:border-[#0052ff]'
                      }
                    `}>
                      <input
                        type="text"
                        required
                        disabled={editForm.email === 'admin@odsstore.vn'}
                        value={editEmailUsername}
                        onChange={(e) => {
                          const val = e.target.value.replace(/@.*/, '').trim().toLowerCase();
                          setEditEmailUsername(val);
                          setEditForm({ ...editForm, email: val ? `${val}@odsstore.vn` : '' });
                          validateEmail(val ? `${val}@odsstore.vn` : '', setEditEmailError);
                        }}
                        className="flex-1 px-3 py-2 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                      />
                      <span className="px-3 bg-slate-200/60 dark:bg-slate-600/60 text-[11px] text-slate-500 dark:text-slate-400 font-extrabold flex items-center border-l border-slate-200 dark:border-slate-600">
                        @odsstore.vn
                      </span>
                    </div>
                    {editEmailError && (
                      <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>{editEmailError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bộ phận */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bộ phận / Chức vụ</label>
                    <select
                      value={editForm.department}
                      onChange={handleEditDepartmentChange}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-[#0052ff] focus:outline-none transition-all"
                    >
                      <option value="Bán hàng">Bán hàng (Sales Assistant)</option>
                      <option value="Admin">Hệ thống (Administrator)</option>
                    </select>
                  </div>

                  {/* Trạng thái hoạt động */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Trạng thái tài khoản</label>
                    <select
                      value={editForm.isActive ? 'active' : 'locked'}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-[#0052ff] focus:outline-none transition-all"
                    >
                      <option value="active">Đang hoạt động (Active)</option>
                      <option value="locked">Khóa tài khoản (Locked)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Đổi mật khẩu (Bỏ trống nếu không đổi)</label>
                    <input 
                      type="text"
                      placeholder="Nhập mật khẩu mới..."
                      value={editForm.password || ''}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:border-[#0052ff] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 2: Phân quyền chi tiết (RBAC) */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-[#0052ff] uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">Phần 2: Cập quyền phân hệ chi tiết</h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Module 1: Kho hàng */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h5 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-200/60 pb-1.5">M. KHO HÀNG</h5>
                    
                    <div className="space-y-2.5">
                      {[
                        { key: 'viewStock', label: 'Xem Tồn kho' },
                        { key: 'addProduct', label: 'Thêm Sản phẩm' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">{item.label}</span>
                          <button
                            type="button"
                            disabled={!editForm.isActive}
                            onClick={() => handleTogglePermission(item.key)}
                            className={`focus:outline-none transition-opacity ${!editForm.isActive && 'opacity-30 cursor-not-allowed'}`}
                          >
                            {editForm.permissions[item.key] ? (
                              <ToggleRight className="w-9 h-5.5 text-[#0052ff]" />
                            ) : (
                              <ToggleLeft className="w-9 h-5.5 text-slate-300" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Module 2: Đơn hàng */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h5 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-200/60 pb-1.5">M. ĐƠN HÀNG</h5>
                    
                    <div className="space-y-2.5">
                      {[
                        { key: 'createOrderPos', label: 'Bán hàng' },
                        { key: 'editOrder', label: 'Sửa Đơn hàng' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">{item.label}</span>
                          <button
                            type="button"
                            disabled={!editForm.isActive}
                            onClick={() => handleTogglePermission(item.key)}
                            className={`focus:outline-none transition-opacity ${!editForm.isActive && 'opacity-30 cursor-not-allowed'}`}
                          >
                            {editForm.permissions[item.key] ? (
                              <ToggleRight className="w-9 h-5.5 text-[#0052ff]" />
                            ) : (
                              <ToggleLeft className="w-9 h-5.5 text-slate-300" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Module 3: Khách hàng */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h5 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-200/60 pb-1.5">M. KHÁCH HÀNG</h5>
                    
                    <div className="space-y-2.5">
                      {[
                        { key: 'viewCustomers', label: 'Xem Khách hàng' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">{item.label}</span>
                          <button
                            type="button"
                            disabled={!editForm.isActive}
                            onClick={() => handleTogglePermission(item.key)}
                            className={`focus:outline-none transition-opacity ${!editForm.isActive && 'opacity-30 cursor-not-allowed'}`}
                          >
                            {editForm.permissions[item.key] ? (
                              <ToggleRight className="w-9 h-5.5 text-[#0052ff]" />
                            ) : (
                              <ToggleLeft className="w-9 h-5.5 text-slate-300" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Module 4: Báo cáo */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h5 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-200/60 pb-1.5">M. BÁO CÁO</h5>
                    
                    <div className="space-y-2.5">
                      {[
                        { key: 'viewRevenue', label: 'Xem Doanh thu' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">{item.label}</span>
                          <button
                            type="button"
                            disabled={!editForm.isActive}
                            onClick={() => handleTogglePermission(item.key)}
                            className={`focus:outline-none transition-opacity ${!editForm.isActive && 'opacity-30 cursor-not-allowed'}`}
                          >
                            {editForm.permissions[item.key] ? (
                              <ToggleRight className="w-9 h-5.5 text-[#0052ff]" />
                            ) : (
                              <ToggleLeft className="w-9 h-5.5 text-slate-300" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={!!editEmailError || !editForm.email}
                  className={`px-4 py-2.5 text-xs font-bold rounded-lg text-white transition-all
                    ${(!!editEmailError || !editForm.email) 
                      ? 'bg-slate-300 border-transparent cursor-not-allowed' 
                      : 'bg-[#0052ff] hover:bg-[#0042d1] shadow-md shadow-[#0052ff]/10 active:scale-95'
                    }
                  `}
                >
                  LƯU & CẤP QUYỀN
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setDeleteModal({ isOpen: false, id: null, email: '' })} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Xác nhận xóa tài khoản</h3>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Bạn có chắc chắn muốn xóa tài khoản nhân viên <span className="font-bold text-[#0052ff] dark:text-[#6699ff]">{deleteModal.email}</span> không?
              </p>
              <p className="text-[11px] text-rose-500 font-medium mt-3 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg border border-rose-100 dark:border-rose-800">
                Lưu ý: Thao tác này không thể hoàn tác!
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null, email: '' })}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                HỦY BỎ
              </button>
              <button 
                onClick={confirmDeleteStaff}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 transition-colors"
              >
                XÓA TÀI KHOẢN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setAlertModal({ isOpen: false, type: '', message: '' })} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-black/50 border border-slate-200 dark:border-slate-700 w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                {alertModal.type === 'success' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                )}
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                  {alertModal.type === 'success' ? 'Thành công!' : 'Lỗi'}
                </h3>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  {alertModal.message}
                </p>
              </div>
              <button 
                onClick={() => setAlertModal({ isOpen: false, type: '', message: '' })}
                className="w-full px-4 py-2 bg-[#0052FF] text-white text-[13px] font-bold rounded-lg hover:bg-[#0042d1] transition-colors shadow-md shadow-[#0052FF]/20"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Accounts;
