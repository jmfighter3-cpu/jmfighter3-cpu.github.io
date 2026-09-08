/**
 * ============================================================================
 * 나만의 포트폴리오 인터랙션 스크립트 (script.js)
 * 상단 탭 버튼을 클릭했을 때 알맞은 화면을 부드럽게 보여주는 기능을 담당합니다.
 * ============================================================================
 */

// HTML 문서의 모든 요소가 다 준비(로딩)되었을 때 자바스크립트 코드를 실행합니다.
document.addEventListener("DOMContentLoaded", () => {
  // 1. 모든 탭 버튼들과 모든 탭 화면(패널) 요소들을 찾아옵니다.
  // document.querySelectorAll()은 조건에 맞는 모든 HTML 태그들을 배열과 유사한 형태로 가져옵니다.
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // 2. 찾아온 각각의 탭 버튼에 '클릭(click)' 이벤트를 걸어줍니다.
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 2-1. 클릭한 버튼의 data-tab 속성값(예: 'about', 'projects', 'blank')을 읽어옵니다.
      const targetTabId = button.getAttribute("data-tab");

      // 2-2. 기존에 선택되어 있던 모든 탭 버튼에서 'active' 클래스를 제거합니다.
      tabButtons.forEach((btn) => btn.classList.remove("active"));

      // 2-3. 기존에 화면에 보이고 있던 모든 탭 화면에서 'active' 클래스를 제거하여 숨깁니다.
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // 2-4. 지금 사용자가 방금 클릭한 버튼에만 'active' 클래스를 추가해 강조합니다.
      button.classList.add("active");

      // 2-5. 클릭한 탭의 ID와 일치하는 화면을 찾아서 'active' 클래스를 추가해 화면에 띄웁니다.
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });
});

