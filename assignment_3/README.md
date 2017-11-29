## Trabalho 3 - Computação Gráfica

Trabalho desenvolvido para a disciplina de computação gráfica, ministrada no segundo semestre de 2017 na UFRJ pelo professor Cláudio Esperança.

## Objetivo

O objetivo desse trabalho é permitir a manipulação de um objeto 3D qualquer, modelado por alguma ferramenta externa e fornecido em formato *.3ds*. Além da movimentação com 6 graus de liberdade, buscamos permitir que o usuário crie interpolações de quadros chave, de modo a criar uma espécie de animação.

## Comandos básicos
- **Transalação:** para transladar o objeto basta manter o botão direito do mouse pressionado e mover na tela. É importante notar que caso o usuário clique fora do objeto, este será movido automáticamente para a posição que foi clicada na tela.
- **Rotação:** para rotacionar o objeto pressione o botão esquerdo do mouse e mova. O paradigma usado para a rotação foi o *Arcball*, então deve-se sempre pensar que o objeto está envolto em uma esfera na hora de rotacionar.
- **Zoom:** para aproximar ou afastar o objeto do campo de visão é necessário utilizar o *mouse wheel*, ou seja, a rolagem do mouse.

## Criando uma animação

Para criar uma animação é necessário salvar as posições intermediárias desta. Ou seja, o usuário deve salvar várias posições diferentes em quadros diferentes, para que depois sejam interpoladas.

Quanto maior o espaço de quadros em branco entre dois quadros preeenchidos mais suave será a interpolação entre suas duas posições. Por exemplo, caso duas posições distintas sejam salvas nos quadros 1 e 2, a transição entre elas será brusca, quase como um ¨teleporte¨. Caso as mesmas posições sejam salvas uma no quadro 1 e outra no quadro 25, a transição será suave.

Para animar as posições salvas é possível utilizar o botão de Play no canto superior direito da tela ou mover a barra de centro superior da tela, em qualquer um dos sentidos.


## Execução

Para executar o projeto execute no terminal um servidor hhtp, por exemplo:

```
python3 -m http.server
```

Feito isso abra o seu navegador no endereço abaixo e selecione o arquivo *main.html*

```
http://127.0.0.1:8000/
```