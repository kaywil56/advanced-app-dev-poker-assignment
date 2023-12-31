import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import GameOver from "../components/Game/GameOver";
import { MemoryRouter } from "react-router-dom";

describe("Game over component test", () => {
  test("GameOver component renders properly with one winner", () => {
    const mockWinner = [
      {
        email: "test@mail.co.nz",
        rank: { type: "Three of a kind" },
      }
    ];
    render(
      <MemoryRouter>
        <GameOver winners={mockWinner} />
      </MemoryRouter>
    );
    // Assert that mock props are displayed
    expect(screen.getByText(/Three of a kind/)).to.exist;
    expect(screen.getByText(/test@mail.co.nz/)).to.exist;
  });
  test("GameOver component renders properly with a draw", () => {
    const mockWinner = [
      {
        email: "test@mail.co.nz",
        rank: { type: "Straight" },
      },
      {
        email: "jdoe@mail.co.nz",
        rank: { type: "Straight" },
      }
    ];
    render(
      <MemoryRouter>
        <GameOver winners={mockWinner} />
      </MemoryRouter>
    );
    // Assert that mock props are displayed
    const multipleWinningHandRanks = screen.getAllByText(/Straight/)
    expect(multipleWinningHandRanks).toHaveLength(2)
    expect(screen.getByText(/test@mail.co.nz/)).to.exist;
    expect(screen.getByText(/jdoe@mail.co.nz/)).to.exist;
  });
});
