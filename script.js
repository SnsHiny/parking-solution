// 模拟停车场数据
var parkingLots = [
    {
        id: 1,
        name: "中央商务区停车场",
        address: "北京市朝阳区建国路88号",
        distance: 0.5,
        availableSpaces: 23,
        totalSpaces: 150,
        hourlyRate: 15,
        open24Hours: true,
        hasEVChargers: true,
        availableChargers: 5,
        totalChargers: 10,
        rating: 4.5,
        latitude: 39.9087,
        longitude: 116.4669
    },
    {
        id: 2,
        name: "国贸中心地下停车场",
        address: "北京市朝阳区建国门外大街1号",
        distance: 0.8,
        availableSpaces: 8,
        totalSpaces: 200,
        hourlyRate: 20,
        open24Hours: true,
        hasEVChargers: true,
        availableChargers: 2,
        totalChargers: 8,
        rating: 4.2,
        latitude: 39.9139,
        longitude: 116.4668
    },
    {
        id: 3,
        name: "财富中心停车场",
        address: "北京市朝阳区东三环中路7号",
        distance: 1.2,
        availableSpaces: 45,
        totalSpaces: 180,
        hourlyRate: 12,
        open24Hours: false,
        hasEVChargers: false,
        availableChargers: 0,
        totalChargers: 0,
        rating: 4.0,
        latitude: 39.9111,
        longitude: 116.4713
    },
    {
        id: 4,
        name: "朝阳公园停车场",
        address: "北京市朝阳区朝阳公园路1号",
        distance: 1.5,
        availableSpaces: 120,
        totalSpaces: 300,
        hourlyRate: 10,
        open24Hours: false,
        hasEVChargers: true,
        availableChargers: 8,
        totalChargers: 15,
        rating: 4.3,
        latitude: 39.9364,
        longitude: 116.4701
    },
    {
        id: 5,
        name: "三里屯SOHO停车场",
        address: "北京市朝阳区工体北路8号",
        distance: 1.8,
        availableSpaces: 5,
        totalSpaces: 120,
        hourlyRate: 25,
        open24Hours: true,
        hasEVChargers: true,
        availableChargers: 1,
        totalChargers: 6,
        rating: 3.8,
        latitude: 39.9345,
        longitude: 116.4537
    }
];

// 全局变量
var currentLocation = { latitude: 39.9087, longitude: 116.4669 };
var parkingHistory = JSON.parse(localStorage.getItem('parkingHistory')) || [];
var selectedParkingLot = null;

// DOM元素
var parkingList = document.getElementById('parking-list');
var parkingHistoryEl = document.getElementById('parking-history');
var parkingModal = document.getElementById('parking-modal');
var routeModal = document.getElementById('route-modal');
var recordModal = document.getElementById('record-modal');
var modalTitle = document.getElementById('modal-title');
var modalBody = document.getElementById('modal-body');
var routeBody = document.getElementById('route-body');
var currentLocationEl = document.getElementById('current-location');
var navigateBtn = document.getElementById('navigate-btn');
var recordBtn = document.getElementById('record-btn');
var shareBtn = document.getElementById('share-btn');
var locationBtn = document.getElementById('location-btn');
var searchBtn = document.getElementById('search-btn');
var searchInput = document.getElementById('search-input');

// 初始化
function init() {
    // 加载停车场列表
    renderParkingLots();
    // 加载停车记录
    renderParkingHistory();
    // 获取当前位置
    getCurrentLocation();
    // 设置事件监听器
    setupEventListeners();
    // 设置当前时间
    setCurrentTime();
}

// 渲染停车场列表
function renderParkingLots(lots) {
    if (!lots) {
        lots = parkingLots;
    }
    parkingList.innerHTML = '';
    
    for (var i = 0; i < lots.length; i++) {
        var lot = lots[i];
        var availabilityClass = 'available';
        var availabilityText = '有' + lot.availableSpaces + '个空位';
        if (lot.availableSpaces <= 10 && lot.availableSpaces > 0) {
            availabilityClass = 'limited';
            availabilityText = '仅剩' + lot.availableSpaces + '个空位';
        } else if (lot.availableSpaces === 0) {
            availabilityClass = 'full';
            availabilityText = '已满';
        }
        
        var parkingCard = document.createElement('div');
        parkingCard.className = 'parking-card';
        parkingCard.onclick = function(lotParam) {
            return function() {
                showParkingDetails(lotParam);
            };
        }(lot);
        
        var evChargerHtml = '';
        if (lot.hasEVChargers) {
            evChargerHtml = '<div class="info-row"><span class="info-icon">🔋</span><span>充电桩可用: ' + lot.availableChargers + '/' + lot.totalChargers + '</span></div>';
        }
        
        parkingCard.innerHTML = '<h3>' + lot.name + '</h3><div class="parking-info"><div class="info-row"><span class="info-icon">📍</span><span>' + lot.address + '</span></div><div class="info-row"><span class="info-icon">🚶</span><span>距离 ' + lot.distance + ' 公里</span></div>' + evChargerHtml + '<div class="info-row"><span class="info-icon">⏰</span><span>' + (lot.open24Hours ? '24小时开放' : '限时开放') + '</span></div></div><div class="parking-stats"><div class="availability"><div class="availability-dot ' + availabilityClass + '"></div><span class="availability-text">' + availabilityText + '</span></div><div class="price">¥' + lot.hourlyRate + '/小时</div></div>';
        
        parkingList.appendChild(parkingCard);
    }
}

// 渲染停车记录
function renderParkingHistory() {
    parkingHistoryEl.innerHTML = '';
    
    if (parkingHistory.length === 0) {
        parkingHistoryEl.innerHTML = '<div class="empty-state"><span class="empty-icon">🅿️</span><p>暂无停车记录</p><p class="empty-subtext">停车后点击"记录位置"保存</p></div>';
        return;
    }
    
    for (var i = 0; i < parkingHistory.length; i++) {
        var record = parkingHistory[i];
        var historyCard = document.createElement('div');
        historyCard.className = 'history-card';
        
        var recordTime = new Date(record.timestamp);
        var formattedTime = recordTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        historyCard.innerHTML = '<h3>' + record.parkingLotName + '</h3><div class="history-info"><div class="info-row"><span class="info-icon">📍</span><span>' + record.address + '</span></div><div class="info-row"><span class="info-icon">🚗</span><span>停车位: ' + record.parkingSpace + '</span></div><div class="info-row"><span class="info-icon">⏰</span><span>停车时间: ' + formattedTime + '</span></div></div><div class="history-actions"><button class="history-btn" onclick="navigateToParking(' + record.id + ')"><span class="btn-icon">🧭</span><span>导航前往</span></button><button class="history-btn" onclick="deleteParkingRecord(' + record.id + ')"><span class="btn-icon">🗑️</span><span>删除</span></button></div>';
        
        parkingHistoryEl.appendChild(historyCard);
    }
}

// 显示停车场详情
function showParkingDetails(lot) {
    selectedParkingLot = lot;
    modalTitle.textContent = lot.name;
    
    var availabilityClass = 'available';
    var availabilityText = '有' + lot.availableSpaces + '个空位';
    if (lot.availableSpaces <= 10 && lot.availableSpaces > 0) {
        availabilityClass = 'limited';
        availabilityText = '仅剩' + lot.availableSpaces + '个空位';
    } else if (lot.availableSpaces === 0) {
        availabilityClass = 'full';
        availabilityText = '已满';
    }
    
    var evChargerHtml = '';
    if (lot.hasEVChargers) {
        evChargerHtml = '<div class="info-row"><span class="info-icon">🔋</span><span>充电桩: ' + lot.availableChargers + '/' + lot.totalChargers + ' 个可用</span></div>';
    }
    
    modalBody.innerHTML = '<div class="parking-info"><div class="info-row"><span class="info-icon">📍</span><span>' + lot.address + '</span></div><div class="info-row"><span class="info-icon">🚶</span><span>距离 ' + lot.distance + ' 公里</span></div><div class="info-row"><span class="info-icon">🅿️</span><span>总车位: ' + lot.totalSpaces + ' 个</span></div><div class="info-row"><span class="info-icon">✅</span><span><div class="availability"><div class="availability-dot ' + availabilityClass + '"></div><span class="availability-text">' + availabilityText + '</span></div></span></div><div class="info-row"><span class="info-icon">💰</span><span> hourly rate: ¥' + lot.hourlyRate + '/小时</span></div><div class="info-row"><span class="info-icon">⏰</span><span>' + (lot.open24Hours ? '24小时开放' : '限时开放') + '</span></div>' + evChargerHtml + '<div class="info-row"><span class="info-icon">⭐</span><span>评分: ' + lot.rating + ' / 5.0</span></div></div>';
    
    parkingModal.classList.remove('hidden');
}

// 规划路线
function planRoute() {
    if (!selectedParkingLot) {
        // 如果没有选择停车场，显示最佳推荐
        selectedParkingLot = findBestParkingLot();
    }
    
    var routeSteps = generateRouteSteps(selectedParkingLot);
    
    var routeStepsHtml = '';
    for (var i = 0; i < routeSteps.length; i++) {
        var step = routeSteps[i];
        routeStepsHtml += '<div class="route-step"><div class="step-number">' + (i + 1) + '</div><div class="step-content"><h4>' + step.title + '</h4><p>' + step.description + '</p></div></div>';
    }
    
    routeBody.innerHTML = '<div class="route-info"><h3>前往 ' + selectedParkingLot.name + '</h3><p class="info-row"><span class="info-icon">📍</span><span>' + selectedParkingLot.address + '</span></p><p class="info-row"><span class="info-icon">🚗</span><span>预计行驶时间: ' + Math.round(selectedParkingLot.distance * 3) + ' 分钟</span></p><p class="info-row"><span class="info-icon">💰</span><span>预计停车费用: ¥' + selectedParkingLot.hourlyRate + ' / 小时</span></p><h4>导航路线</h4>' + routeStepsHtml + '</div>';
    
    routeModal.classList.remove('hidden');
}

// 生成路线步骤
function generateRouteSteps(parkingLot) {
    var steps = [];
    steps.push({title: '从当前位置出发', description: '向正东方向行驶，进入建国路'});
    steps.push({title: '直行', description: '沿建国路行驶约' + (parkingLot.distance * 0.6) + '公里'});
    steps.push({title: '转弯', description: '在第一个路口右转'});
    steps.push({title: '到达目的地', description: '进入' + parkingLot.name + '停车场，寻找可用车位'});
    return steps;
}

// 查找最佳停车场
function findBestParkingLot() {
    // 综合考虑距离、价格和可用车位
    var bestLot = parkingLots[0];
    var bestScore = 0;
    for (var i = 0; i < parkingLots.length; i++) {
        var lot = parkingLots[i];
        var score = (lot.availableSpaces / lot.totalSpaces) * 0.4 + (1 / lot.hourlyRate) * 0.3 + (1 / lot.distance) * 0.3;
        if (score > bestScore) {
            bestScore = score;
            bestLot = lot;
        }
    }
    return bestLot;
}

// 记录停车位置
function recordParkingLocation() {
    recordModal.classList.remove('hidden');
}

// 保存停车记录
function saveParkingRecord() {
    var parkingLotName = document.getElementById('parking-lot-name').value;
    var parkingSpace = document.getElementById('parking-space').value;
    var parkingTime = document.getElementById('parking-time').value;
    
    if (!parkingLotName || !parkingSpace || !parkingTime) {
        alert('请填写完整信息');
        return;
    }
    
    var newRecord = {
        id: Date.now(),
        parkingLotName: parkingLotName,
        parkingSpace: parkingSpace,
        timestamp: parkingTime,
        address: currentLocationEl.textContent,
        location: currentLocation
    };
    
    parkingHistory.unshift(newRecord);
    localStorage.setItem('parkingHistory', JSON.stringify(parkingHistory));
    
    recordModal.classList.add('hidden');
    renderParkingHistory();
    
    // 重置表单
    document.getElementById('parking-lot-name').value = '';
    document.getElementById('parking-space').value = '';
    setCurrentTime();
}

// 导航到停车位置
function navigateToParking(recordId) {
    for (var i = 0; i < parkingHistory.length; i++) {
        var record = parkingHistory[i];
        if (record.id === recordId) {
            alert('正在导航到 ' + record.parkingLotName + '，停车位: ' + record.parkingSpace);
            break;
        }
    }
}

// 删除停车记录
function deleteParkingRecord(recordId) {
    if (confirm('确定要删除这条停车记录吗？')) {
        var newHistory = [];
        for (var i = 0; i < parkingHistory.length; i++) {
            if (parkingHistory[i].id !== recordId) {
                newHistory.push(parkingHistory[i]);
            }
        }
        parkingHistory = newHistory;
        localStorage.setItem('parkingHistory', JSON.stringify(parkingHistory));
        renderParkingHistory();
    }
}

// 分享
function shareParkingInfo() {
    if (!selectedParkingLot) {
        alert('请先选择一个停车场');
        return;
    }
    
    var shareText = '推荐停车场：' + selectedParkingLot.name + '\n地址：' + selectedParkingLot.address + '\n距离：' + selectedParkingLot.distance + '公里\n价格：¥' + selectedParkingLot.hourlyRate + '/小时\n可用车位：' + selectedParkingLot.availableSpaces + '个';
    
    if (navigator.share) {
        navigator.share({
            title: '推荐停车场',
            text: shareText,
            url: window.location.href
        }).catch(function(err) {
            console.error('分享失败:', err);
            // 降级方案
            copyToClipboard(shareText);
        });
    } else {
        // 降级方案
        copyToClipboard(shareText);
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('信息已复制到剪贴板');
    }).catch(function(err) {
        console.error('复制失败:', err);
        alert('分享功能暂不可用');
    });
}

// 获取当前位置
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                reverseGeocode(currentLocation);
            },
            function(error) {
                console.error('获取位置失败:', error);
                currentLocationEl.textContent = '无法获取位置信息';
            }
        );
    } else {
        currentLocationEl.textContent = '浏览器不支持地理位置';
    }
}

// 反向地理编码（模拟）
function reverseGeocode(location) {
    // 模拟反向地理编码
    currentLocationEl.textContent = '北京市朝阳区建国路附近';
}

// 设置当前时间
function setCurrentTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    
    var formattedTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
    document.getElementById('parking-time').value = formattedTime;
}

// 搜索停车场
function searchParkingLots() {
    var searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) {
        renderParkingLots();
        return;
    }
    
    var filteredLots = [];
    for (var i = 0; i < parkingLots.length; i++) {
        var lot = parkingLots[i];
        if (lot.name.toLowerCase().indexOf(searchTerm) !== -1 || lot.address.toLowerCase().indexOf(searchTerm) !== -1) {
            filteredLots.push(lot);
        }
    }
    
    renderParkingLots(filteredLots);
}

// 设置事件监听器
function setupEventListeners() {
    // 关闭模态框
    document.getElementById('close-modal').onclick = function() {
        parkingModal.classList.add('hidden');
    };
    document.getElementById('close-route-modal').onclick = function() {
        routeModal.classList.add('hidden');
    };
    document.getElementById('close-record-modal').onclick = function() {
        recordModal.classList.add('hidden');
    };
    
    // 模态框外部点击关闭
    parkingModal.onclick = function(e) {
        if (e.target === parkingModal) {
            parkingModal.classList.add('hidden');
        }
    };
    
    routeModal.onclick = function(e) {
        if (e.target === routeModal) {
            routeModal.classList.add('hidden');
        }
    };
    
    recordModal.onclick = function(e) {
        if (e.target === recordModal) {
            recordModal.classList.add('hidden');
        }
    };
    
    // 按钮事件
    navigateBtn.onclick = planRoute;
    recordBtn.onclick = recordParkingLocation;
    shareBtn.onclick = shareParkingInfo;
    locationBtn.onclick = getCurrentLocation;
    searchBtn.onclick = searchParkingLots;
    
    // 搜索框回车
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchParkingLots();
        }
    });
    
    // 保存记录
    document.getElementById('save-record-btn').onclick = saveParkingRecord;
    
    // 模态框中的导航按钮
    document.getElementById('modal-navigate-btn').onclick = function() {
        parkingModal.classList.add('hidden');
        planRoute();
    };
    
    // 开始导航
    document.getElementById('start-navigation').onclick = function() {
        routeModal.classList.add('hidden');
        alert('正在导航到 ' + selectedParkingLot.name);
    };
}

// 初始化应用
init();

// 每30秒更新一次停车场数据（模拟实时更新）
setInterval(function() {
    // 随机更新可用车位数量
    for (var i = 0; i < parkingLots.length; i++) {
        var lot = parkingLots[i];
        var change = Math.floor(Math.random() * 5) - 2; // -2 到 2 的随机变化
        lot.availableSpaces = Math.max(0, Math.min(lot.totalSpaces, lot.availableSpaces + change));
        
        // 随机更新充电桩数量
        if (lot.hasEVChargers) {
            var chargerChange = Math.floor(Math.random() * 3) - 1; // -1 到 1 的随机变化
            lot.availableChargers = Math.max(0, Math.min(lot.totalChargers, lot.availableChargers + chargerChange));
        }
    }
    
    // 重新渲染
    renderParkingLots();
}, 30000);