import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
export function ReportesTemplate() {
  return (
    <Container>
      <PageContainer>
        <Content>
          <Outlet/>
        </Content>
        <Sidebar>
          {/*<SidebarSection>
            <SidebarTitle>Stock Actual</SidebarTitle>
            <SidebarItem to="stock-actual-por-producto">
              Por producto
            </SidebarItem>
            <SidebarItem to="stock-actual-todos">Todos</SidebarItem>
            
          </SidebarSection>*/}
          <SidebarSection>
          <SidebarTitle>Generar Reportes</SidebarTitle>
          <SidebarItem to="kardex-entradas-salidas">Reporte Pecosa</SidebarItem>
          
          <SidebarItem to="kardex-entradas">Reporte Nea</SidebarItem>
          </SidebarSection>



          <SidebarSection>
          <SidebarTitle to="ss">Historial de Reportes</SidebarTitle>
          <SidebarItem to="historial-pecosas">Historial Pecosa</SidebarItem>
          <SidebarItem to="historial-neas">Historial Neas</SidebarItem>
          </SidebarSection>
 
 
          <SidebarSection>
          <SidebarTitle to="ss">Edición de Reportes</SidebarTitle>
          <SidebarItem to="edicion-pecosas">Edición Pecosa</SidebarItem>
          <SidebarItem to="edicion-neas">Edición Nea</SidebarItem>
          </SidebarSection>
 
 
 
        </Sidebar>
      </PageContainer>
    </Container>
  );
}
const Content = styled.div`
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  flex: 1;
`;
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  justify-content: center;
  width: 100%;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;
const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  color: ${({ theme }) => theme.text};
`;
const Sidebar = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  @media (min-width: 768px) {
    width: 250px;
    order: 2;
  }
`;
const SidebarSection = styled.div`
  margin-bottom: 20px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.color2};
  padding: 12px;
`;
const SidebarTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 1.2em;
`;
const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  margin: 5px 0;
  padding: 0 5%;
  text-decoration: none;
  color: ${(props) => props.theme.text};
  height: 60px;
  &:hover {
    color: ${(props) => props.theme.colorSubtitle};
  }
  &.active {
    background: ${(props) => props.theme.bg6};
    border: 2px solid ${(props) => props.theme.bg5};
    color: ${(props) => props.theme.color1};
    font-weight: 600;
  }
`;
