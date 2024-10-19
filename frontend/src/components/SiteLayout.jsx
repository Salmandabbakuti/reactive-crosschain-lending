import { Layout } from "antd";
import ConnectWalletButton from "./ConnectWalletButton";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 99,
          padding: 0,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <p
          style={{
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "15px",
            margin: "0 12px"
          }}
        >
          Cross Lending
        </p>
        <ConnectWalletButton />
      </Header>
      <Content
        style={{
          margin: "12px 8px",
          padding: 8,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} Cross Lending Dapp. Powered by Reactive
          Network
        </a>
        <p style={{ fontSize: "12px" }}>v0.0.2</p>
      </Footer>
    </Layout>
  );
}
