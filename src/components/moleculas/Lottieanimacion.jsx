import styled from "styled-components";
import { Player } from "@lottiefiles/react-lottie-player";

export function Lottieanimacion({ alto, ancho, animacion }) {
  return (
    <Container>
      <Player
        autoplay
        loop
        src={animacion}
        style={{ height: `${alto}px`, width: `${ancho}px` }}
      />
    </Container>
  );
}

const Container = styled.div``;
