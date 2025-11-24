import { ethers } from "ethers";
import { createInstance, FhevmInstance, initFhevm } from "fhevmjs";
import EncryptedAdderABI from "./abis/EncryptedAdder.json";

// Конфигурация
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const RELAYER_URI = import.meta.env.VITE_RELAYER_URI;
const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "8009");

// Глобальные переменные
let fhevmInstance: FhevmInstance;
let contract: ethers.Contract;
let signer: ethers.Signer;

// Инициализация приложения
async function initApp() {
  // 1. Подключение MetaMask
  if (!window.ethereum) throw new Error("Установите MetaMask!");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  
  // 2. Инициализация ethers.js
  const provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  
  // 3. Загрузка FHEVM
  await initFhevm();
  fhevmInstance = await createInstance({
    chainId: CHAIN_ID,
    publicKey: "auto",
    relayerUrl: RELAYER_URI
  });
  
  // 4. Инициализация контракта
  contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    EncryptedAdderABI.abi,
    signer
  );
  
  // Активация UI
  document.getElementById("computeBtn")!.disabled = false;
  updateStatus("✅ Система готова к работе");
}

// Обработчик вычислений
async function handleCompute() {
  const a = parseInt((document.getElementById("a") as HTMLInputElement).value);
  const b = parseInt((document.getElementById("b") as HTMLInputElement).value);
  
  try {
    // Валидация
    if (isNaN(a) || isNaN(b)) throw new Error("Введите числа!");
    if (a < 0 || b < 0) throw new Error("Только положительные числа!");
    
    updateStatus("🔐 Шифрование данных...");
    disableUI();
    
    // 1. Шифрование данных
    const encryptedA = fhevmInstance.encrypt64(a);
    const encryptedB = fhevmInstance.encrypt64(b);
    
    // 2. Создание proof
    const proof = fhevmInstance.createProof();
    
    // 3. Получение адреса пользователя
    const userAddress = await signer.getAddress();
    
    updateStatus("📝 Отправка данных в контракт...");
    
    // 4. Вызов контракта - setInputs
    const txSet = await contract.setInputs(
      encryptedA,
      encryptedB,
      proof,
      userAddress
    );
    await txSet.wait();
    
    updateStatus("🧮 Вычисление суммы...");
    
    // 5. Вызов контракта - computeSum
    const txCompute = await contract.computeSum(userAddress);
    await txCompute.wait();
    
    updateStatus("🔍 Получение результата...");
    
    // 6. Получение зашифрованного результата
    const encryptedResult = await contract.getLatestSum();
    
    updateStatus("🔓 Расшифровка результата...");
    
    // 7. Расшифровка на клиенте
    const decryptedResult = fhevmInstance.decrypt(encryptedResult);
    
    // 8. Отображение результата
    showResult(`Результат: ${a} + ${b} = ${decryptedResult}`);
    
  } catch (error: any) {
    updateStatus(`❌ Ошибка: ${error.message}`);
    console.error(error);
  } finally {
    enableUI();
  }
}

// Вспомогательные функции
function updateStatus(message: string) {
  document.getElementById("status")!.textContent = message;
}

function showResult(message: string) {
  document.getElementById("result")!.textContent = message;
}

function disableUI() {
  (document.getElementById("computeBtn") as HTMLButtonElement).disabled = true;
}

function enableUI() {
  (document.getElementById("computeBtn") as HTMLButtonElement).disabled = false;
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  initApp().catch(console.error);
  document.getElementById("computeBtn")!.addEventListener("click", handleCompute);
});